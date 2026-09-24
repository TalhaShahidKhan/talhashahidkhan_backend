import { Controller, Get, Res } from '@nestjs/common';
import ejs from 'ejs';
import type { Response } from 'express';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaService } from './prisma/prisma.service.js';

const templatePath = join(
  fileURLToPath(new URL('.', import.meta.url)),
  'views',
  'health.ejs',
);

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth(@Res() response: Response): Promise<void> {
    const startedAt = performance.now();
    let databaseStatus = 'Unavailable';
    let databaseMessage = 'The database health query failed.';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'Connected';
      databaseMessage = 'The database accepted a live query.';
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    const latencyMs = Math.round(performance.now() - startedAt);
    const overallStatus =
      databaseStatus === 'Connected' ? 'healthy' : 'degraded';
    const httpStatus = overallStatus === 'healthy' ? 200 : 503;
    const html = await ejs.renderFile(templatePath, {
      apiStatus: 'Operational',
      databaseStatus,
      databaseMessage,
      latencyMs,
      overallStatus,
      httpStatus,
      serviceName: 'Talha Shahid Khan API',
      environment: process.env.NODE_ENV ?? 'production',
      checkedAt: new Date().toLocaleString(),
    });

    response.status(httpStatus).send(html);
  }
}
