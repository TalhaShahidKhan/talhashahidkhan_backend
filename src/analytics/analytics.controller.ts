import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../admin/auth.guard.js';
import { RecordPageVisitDto, RecordPostAnalyticsDto } from './analytics.dto.js';
import { AnalyticsService } from './analytics.service.js';

@Controller('admin/analytics')
@UseGuards(AdminAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('posts')
  findPostAnalytics() {
    return this.analyticsService.findPostAnalytics();
  }

  @Get('posts/:postId')
  findPostAnalyticsByPostId(@Param('postId') postId: string) {
    return this.analyticsService.findPostAnalyticsByPostId(postId);
  }

  @Post('posts/:postId/events')
  @HttpCode(HttpStatus.CREATED)
  recordPostEvent(
    @Param('postId') postId: string,
    @Body() input: RecordPostAnalyticsDto,
  ) {
    return this.analyticsService.recordPostEvent(postId, input.event);
  }

  @Get('pages')
  findPageAnalytics() {
    return this.analyticsService.findPageAnalytics();
  }

  @Post('pages/visits')
  @HttpCode(HttpStatus.CREATED)
  recordPageVisit(@Body() input: RecordPageVisitDto) {
    return this.analyticsService.recordPageVisit(input);
  }
}
