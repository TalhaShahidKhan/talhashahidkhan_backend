import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  PostAnalyticsEvent,
  type RecordPageVisitDto,
} from './analytics.dto.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPostAnalytics(startDate?: Date, endDate?: Date) {
    const whereClause: any = {};
    if (startDate && endDate) {
      whereClause.updatedAt = { gte: startDate, lte: endDate };
    } else if (startDate) {
      whereClause.updatedAt = { gte: startDate };
    } else if (endDate) {
      whereClause.updatedAt = { lte: endDate };
    }

    const analytics = await this.prisma.postAnalytics.groupBy({
      by: ['postId'],
      _sum: { views: true, shares: true, clicks: true },
      _count: { ipAddress: true },
      where: whereClause,
      orderBy: { postId: 'asc' },
    });
    
    const posts = await this.prisma.post.findMany({
      where: { id: { in: analytics.map(({ postId }) => postId) } },
      select: { id: true, title: true, slug: true },
    });
    const postsById = new Map(posts.map((post) => [post.id, post]));

    const aggregates = analytics.map(({ postId, _sum, _count }) => ({
      post: postsById.get(postId),
      views: _sum.views ?? 0,
      shares: _sum.shares ?? 0,
      clicks: _sum.clicks ?? 0,
      uniqueIPs: _count.ipAddress ?? 0,
    }));

    // Time-series data
    const rawData = await this.prisma.postAnalytics.findMany({
      where: whereClause,
      select: { updatedAt: true, views: true, shares: true, clicks: true },
    });

    const timeSeriesMap = new Map<string, { views: number, shares: number, clicks: number }>();
    rawData.forEach(row => {
      const dateString = row.updatedAt.toISOString().split('T')[0];
      if (!timeSeriesMap.has(dateString)) {
        timeSeriesMap.set(dateString, { views: 0, shares: 0, clicks: 0 });
      }
      const existing = timeSeriesMap.get(dateString)!;
      existing.views += row.views;
      existing.shares += row.shares;
      existing.clicks += row.clicks;
    });

    const timeSeries = Array.from(timeSeriesMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { aggregates, timeSeries };
  }

  async findPostAnalyticsByPostId(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true, slug: true },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const analytics = await this.prisma.postAnalytics.aggregate({
      where: { postId },
      _sum: { views: true, shares: true, clicks: true },
    });

    return {
      post,
      views: analytics._sum.views ?? 0,
      shares: analytics._sum.shares ?? 0,
      clicks: analytics._sum.clicks ?? 0,
    };
  }

  async recordPostEvent(postId: string, event: PostAnalyticsEvent, ip: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const isView = event === PostAnalyticsEvent.VIEW ? 1 : 0;
    const isShare = event === PostAnalyticsEvent.SHARE ? 1 : 0;
    const isClick = event === PostAnalyticsEvent.CLICK ? 1 : 0;

    return this.prisma.postAnalytics.upsert({
      where: { postId_ipAddress: { postId, ipAddress: ip } },
      update: {
        views: { increment: isView },
        shares: { increment: isShare },
        clicks: { increment: isClick },
      },
      create: {
        postId,
        ipAddress: ip,
        views: isView,
        shares: isShare,
        clicks: isClick,
      },
    });
  }

  async findPageAnalytics(startDate?: Date, endDate?: Date) {
    const whereClause: any = {};
    if (startDate && endDate) {
      whereClause.updatedAt = { gte: startDate, lte: endDate };
    } else if (startDate) {
      whereClause.updatedAt = { gte: startDate };
    } else if (endDate) {
      whereClause.updatedAt = { lte: endDate };
    }

    const analytics = await this.prisma.frontendPageAnalytics.groupBy({
      by: ['route', 'pageUrl'],
      _sum: { visitCount: true },
      _count: { ipAddress: true },
      where: whereClause,
      orderBy: [{ route: 'asc' }, { pageUrl: 'asc' }],
    });

    const aggregates = analytics.map(({ route, pageUrl, _sum, _count }) => ({
      route,
      pageUrl,
      visitCount: _sum.visitCount ?? 0,
      uniqueIPs: _count.ipAddress ?? 0,
    }));

    const rawData = await this.prisma.frontendPageAnalytics.findMany({
      where: whereClause,
      select: { updatedAt: true, visitCount: true },
    });

    const timeSeriesMap = new Map<string, number>();
    rawData.forEach(row => {
      const dateString = row.updatedAt.toISOString().split('T')[0];
      timeSeriesMap.set(dateString, (timeSeriesMap.get(dateString) || 0) + row.visitCount);
    });

    const timeSeries = Array.from(timeSeriesMap.entries())
      .map(([date, visits]) => ({ date, visits }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { aggregates, timeSeries };
  }

  recordPageVisit(input: RecordPageVisitDto, ip: string) {
    return this.prisma.frontendPageAnalytics.upsert({
      where: { route_ipAddress: { route: input.route, ipAddress: ip } },
      update: { visitCount: { increment: 1 }, pageUrl: input.pageUrl },
      create: { route: input.route, pageUrl: input.pageUrl, ipAddress: ip, visitCount: 1 },
    });
  }
}
