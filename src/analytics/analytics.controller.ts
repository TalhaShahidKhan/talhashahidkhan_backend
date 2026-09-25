import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../admin/admin-only.decorator.js';
import { RecordPageVisitDto, RecordPostAnalyticsDto } from './analytics.dto.js';
import { AnalyticsService } from './analytics.service.js';

@Controller('admin/analytics')
@AdminOnly()
@ApiTags('Analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Get aggregate analytics for all posts' })
  findPostAnalytics() {
    return this.analyticsService.findPostAnalytics();
  }

  @Get('posts/:postId')
  @ApiOperation({ summary: 'Get aggregate analytics for one post' })
  findPostAnalyticsByPostId(@Param('postId') postId: string) {
    return this.analyticsService.findPostAnalyticsByPostId(postId);
  }

  @Post('posts/:postId/events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a view, share, or click for a post' })
  recordPostEvent(
    @Param('postId') postId: string,
    @Body() input: RecordPostAnalyticsDto,
  ) {
    return this.analyticsService.recordPostEvent(postId, input.event);
  }

  @Get('pages')
  @ApiOperation({ summary: 'Get aggregate page-visit analytics' })
  findPageAnalytics() {
    return this.analyticsService.findPageAnalytics();
  }

  @Post('pages/visits')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a frontend page visit' })
  recordPageVisit(@Body() input: RecordPageVisitDto) {
    return this.analyticsService.recordPageVisit(input);
  }
}
