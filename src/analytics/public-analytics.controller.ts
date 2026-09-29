import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Ip,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '../common/throttler/index.js';
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
    @Ip() ip: string,
  ) {
    const userIp = ip || 'unknown-ip';
    return this.analyticsService.recordPostEvent(postId, input.event, userIp);
  }

  @Post('pages/visits')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Record a frontend page visit' })
  recordPageVisit(@Body() input: RecordPageVisitDto, @Ip() ip: string) {
    const userIp = ip || 'unknown-ip';
    return this.analyticsService.recordPageVisit(input, userIp);
  }
}
