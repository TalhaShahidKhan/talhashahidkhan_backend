import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Ip,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
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
    @Req() req: Request,
  ) {
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
    const userIp = forwardedIp?.trim() || (typeof realIp === 'string' ? realIp : undefined) || ip || 'unknown-ip';
    return this.analyticsService.recordPostEvent(postId, input.event, userIp);
  }

  @Post('pages/visits')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Record a frontend page visit' })
  recordPageVisit(@Body() input: RecordPageVisitDto, @Ip() ip: string, @Req() req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
    const userIp = forwardedIp?.trim() || (typeof realIp === 'string' ? realIp : undefined) || ip || 'unknown-ip';
    return this.analyticsService.recordPageVisit(input, userIp);
  }
}
