import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
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
    await app.init();
    cachedApp = app;
  }
  return server;
}

// Support for local development
if (!process.env.VERCEL) {
  bootstrap().then(() => {
    server.listen(process.env.PORT ?? 3000, () => {
      console.log(`Server listening on port ${process.env.PORT ?? 3000}`);
    });
  });
}

// Export for Vercel Serverless
export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  return app(req, res);
}
