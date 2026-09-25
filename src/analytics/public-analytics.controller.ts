import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RecordPageVisitDto, RecordPostAnalyticsDto } from './analytics.dto.js';
import { AnalyticsService } from './analytics.service.js';

@Controller('analytics')
@ApiTags('Analytics (Public)')
export class PublicAnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('posts/:postId/events')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Record a view, share, or click for a post' })
  recordPostEvent(
    @Param('postId') postId: string,
    @Body() input: RecordPostAnalyticsDto,
  ) {
    return this.analyticsService.recordPostEvent(postId, input.event);
  }

  @Post('pages/visits')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Record a frontend page visit' })
  recordPageVisit(@Body() input: RecordPageVisitDto) {
    return this.analyticsService.recordPageVisit(input);
  }
}
