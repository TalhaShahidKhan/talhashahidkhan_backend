import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthGuard } from '../admin/auth.guard.js';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';
import { PublicAnalyticsController } from './public-analytics.controller.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AnalyticsController, PublicAnalyticsController],
  providers: [AnalyticsService, AdminAuthGuard],
})
export class AnalyticsModule {}
