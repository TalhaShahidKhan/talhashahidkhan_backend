import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../admin/admin-only.decorator.js';
import { AnalyticsService } from './analytics.service.js';

@Controller('admin/analytics')
@AdminOnly()
@ApiTags('Analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Get aggregate analytics for all posts' })
  findPostAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.findPostAnalytics(start, end);
  }

  @Get('posts/:postId')
  @ApiOperation({ summary: 'Get aggregate analytics for one post' })
  findPostAnalyticsByPostId(@Param('postId') postId: string) {
    return this.analyticsService.findPostAnalyticsByPostId(postId);
  }

  @Get('pages')
  @ApiOperation({ summary: 'Get aggregate page-visit analytics' })
  findPageAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.analyticsService.findPageAnalytics(start, end);
  }
}
