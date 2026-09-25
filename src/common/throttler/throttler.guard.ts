import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import {
  SKIP_THROTTLE_METADATA,
  THROTTLE_METADATA,
  type ThrottleOptions,
} from './throttler.decorator.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class ThrottlerGuard implements CanActivate {
  private readonly storage = new Map<string, RateLimitRecord>();
  private readonly defaultOptions: ThrottleOptions = {
    limit: 60,
    ttl: 60000, // 60 seconds
  };

  constructor(private readonly reflector: Reflector) {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.storage.entries()) {
        if (now > record.resetTime) {
          this.storage.delete(key);
        }
      }
    }, 60000);

    if (typeof cleanupInterval.unref === 'function') {
      cleanupInterval.unref();
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_THROTTLE_METADATA,
      [context.getHandler(), context.getClass()],
    );
    if (skip) {
      return true;
    }

    const routeOptions = this.reflector.getAllAndOverride<ThrottleOptions>(
      THROTTLE_METADATA,
      [context.getHandler(), context.getClass()],
    );

    const { limit, ttl } = routeOptions ?? this.defaultOptions;

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    // Support standard proxy headers (e.g. on Vercel)
    const forwarded = req?.headers?.['x-forwarded-for'];
    const ip =
      (typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : Array.isArray(forwarded)
          ? forwarded[0]
          : null) ||
      req?.ip ||
      req?.socket?.remoteAddress ||
      'unknown-client';

    const handlerName = context.getHandler()?.name ?? 'handler';
    const className = context.getClass()?.name ?? 'class';
    const key = `${ip}:${className}:${handlerName}`;
    const now = Date.now();
    const record = this.storage.get(key);

    if (!record || now > record.resetTime) {
      this.storage.set(key, {
        count: 1,
        resetTime: now + ttl,
      });
      this.setHeaders(res, limit, limit - 1, Math.ceil(ttl / 1000));
      return true;
    }

    record.count += 1;
    const remaining = Math.max(0, limit - record.count);
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);

    this.setHeaders(res, limit, remaining, retryAfter);

    if (record.count > limit) {
      if (res?.setHeader && !res.headersSent) {
        res.setHeader('Retry-After', retryAfter);
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too Many Requests',
          error: 'ThrottlerException: Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private setHeaders(
    res: Response,
    limit: number,
    remaining: number,
    retryAfter: number,
  ) {
    if (res?.setHeader && !res.headersSent) {
      res.setHeader('X-RateLimit-Limit', String(limit));
      res.setHeader('X-RateLimit-Remaining', String(remaining));
      res.setHeader('X-RateLimit-Reset', String(retryAfter));
    }
  }
}
