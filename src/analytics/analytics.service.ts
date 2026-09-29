import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  PostAnalyticsEvent,
  type RecordPageVisitDto,
} from './analytics.dto.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPostAnalytics() {
    const analytics = await this.prisma.postAnalytics.groupBy({
      by: ['postId'],
      _sum: { views: true, shares: true, clicks: true },
      orderBy: { postId: 'asc' },
    });
    const posts = await this.prisma.post.findMany({
      where: { id: { in: analytics.map(({ postId }) => postId) } },
      select: { id: true, title: true, slug: true },
    });
    const postsById = new Map(posts.map((post) => [post.id, post]));

    return analytics.map(({ postId, _sum }) => ({
      post: postsById.get(postId),
      views: _sum.views ?? 0,
      shares: _sum.shares ?? 0,
      clicks: _sum.clicks ?? 0,
    }));
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

  async findPageAnalytics() {
    const analytics = await this.prisma.frontendPageAnalytics.groupBy({
      by: ['route', 'pageUrl'],
      _sum: { visitCount: true },
      orderBy: [{ route: 'asc' }, { pageUrl: 'asc' }],
    });

    return analytics.map(({ route, pageUrl, _sum }) => ({
      route,
      pageUrl,
      visitCount: _sum.visitCount ?? 0,
    }));
  }

  recordPageVisit(input: RecordPageVisitDto, ip: string) {
    return this.prisma.frontendPageAnalytics.upsert({
      where: { route_ipAddress: { route: input.route, ipAddress: ip } },
      update: { visitCount: { increment: 1 }, pageUrl: input.pageUrl },
      create: { route: input.route, pageUrl: input.pageUrl, ipAddress: ip, visitCount: 1 },
    });
  }
}
