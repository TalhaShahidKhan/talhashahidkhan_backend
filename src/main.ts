import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import { AppModule } from './app.module.js';

const server = express();
let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.enableCors(); // Added CORS to allow requests from the frontend
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
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
export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  return app(req, res);
}
