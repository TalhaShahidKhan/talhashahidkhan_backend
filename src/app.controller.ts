import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import ejs from 'ejs';
import type { Response } from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaService } from './prisma/prisma.service.js';

function resolveTemplatePath(): string | null {
  const candidates = [
    join(fileURLToPath(new URL('.', import.meta.url)), 'views', 'health.ejs'),
    join(process.cwd(), 'src', 'views', 'health.ejs'),
    join(process.cwd(), 'dist', 'src', 'views', 'health.ejs'),
    join(process.cwd(), 'views', 'health.ejs'),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

@Controller()
@SkipThrottle()
@ApiTags('Health')
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check API and database health' })
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
    const templatePath = resolveTemplatePath();

    const payload = {
      apiStatus: 'Operational',
      databaseStatus,
      databaseMessage,
      latencyMs,
      overallStatus,
      httpStatus,
      serviceName: 'Talha Shahid Khan API',
      environment: process.env.NODE_ENV ?? 'production',
      checkedAt: new Date().toLocaleString(),
    };

    if (templatePath) {
      try {
        const html = await ejs.renderFile(templatePath, payload);
        response.status(httpStatus).send(html);
        return;
      } catch (renderError) {
        console.error('Failed to render health template:', renderError);
      }
    }

    // Fallback to JSON if template is missing or fails to render
    response.status(httpStatus).json({
      ...payload,
      checkedAt: new Date().toISOString(),
    });
  }
}

