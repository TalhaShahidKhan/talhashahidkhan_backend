import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

const server = express();
let cachedApp: ReturnType<typeof NestFactory.create> extends Promise<infer T>
  ? T
  : never;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    // Security headers
    app.use(helmet());

    // CORS — restricted by CORS_ORIGINS env var
    const allowedOrigins = process.env.CORS_ORIGINS;
    app.enableCors({
      origin: allowedOrigins
        ? allowedOrigins.split(',').map((s) => s.trim())
        : process.env.NODE_ENV === 'production'
          ? false
          : true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Swagger — only in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      const swaggerConfig = new DocumentBuilder()
        .setTitle('Talha Shahid Khan Backend API')
        .setDescription(
          'API documentation for health checks, public content, visitor submissions, admin management, and analytics.',
        )
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, swaggerConfig);
      SwaggerModule.setup('docs', app, document, {
        jsonDocumentUrl: 'docs-json',
        customSiteTitle: 'Talha Shahid Khan API Docs',
      });
    }

    await app.init();
    cachedApp = app;
  }
  return server;
}

// Support for local development
if (process.env.VERCEL !== 'true') {
  bootstrap()
    .then(() => {
      server.listen(process.env.PORT ?? 3000, () => {
        console.log(`Server listening on port ${process.env.PORT ?? 3000}`);
      });
    })
    .catch((error: unknown) => {
      console.error('Unable to start the API:', error);
      process.exitCode = 1;
    });
}

// Export for Vercel Serverless
export default async function handler(req: Request, res: Response) {
  const app = await bootstrap();
  return app(req, res);
}
