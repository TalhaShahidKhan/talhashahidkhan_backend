import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthGuard } from '../admin/auth.guard.js';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AdminAuthGuard],
})
export class AnalyticsModule {}
