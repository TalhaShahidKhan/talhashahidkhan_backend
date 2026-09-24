import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  AdminTokenPayload,
  AuthenticatedAdminRequest,
} from './auth.types.js';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedAdminRequest>();
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : undefined;

    if (!token) {
      throw new UnauthorizedException('Authentication is required');
    }

    try {
      const payload = await this.jwt.verifyAsync<AdminTokenPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        issuer: this.config.get<string>('JWT_ISSUER', 'admin-api'),
        audience: this.config.get<string>('JWT_AUDIENCE', 'admin-panel'),
      });
      const session = await this.prisma.authSession.findUnique({
        where: { jti: payload.jti },
        include: { user: true },
      });

      if (
        !session ||
        session.userId !== payload.sub ||
        session.revokedAt ||
        session.expiresAt <= new Date() ||
        session.user.role !== 'ADMIN'
      ) {
        throw new UnauthorizedException('Invalid authentication session');
      }

      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
