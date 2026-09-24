import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { createHash, randomInt, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AdminTokenPayload } from './auth.types.js';
import type { LoginDto } from './dto/login.dto.js';
import type { PasswordChangeDto } from './dto/password-change.dto.js';
import type { PasswordResetDto } from './dto/password-reset.dto.js';
import { MailService } from './mail.service.js';

@Injectable()
export class AdminService {
  private readonly actionTokenLifetimeMs = 10 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async login(input: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        role: 'ADMIN',
        OR: [
          { email: input.usernameOrEmail },
          { username: input.usernameOrEmail },
        ],
      },
    });

    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const jti = randomUUID();
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '15m');
    const expiresInMs = this.parseDuration(expiresIn);
    const expiresAt = new Date(Date.now() + expiresInMs);
    const payload: AdminTokenPayload = { sub: user.id, jti, role: 'ADMIN' };

    await this.prisma.authSession.create({
      data: { jti, userId: user.id, expiresAt },
    });

    try {
      const accessToken = await this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: Math.floor(expiresInMs / 1000),
        issuer: this.config.get<string>('JWT_ISSUER', 'admin-api'),
        audience: this.config.get<string>('JWT_AUDIENCE', 'admin-panel'),
      });
      return { accessToken, expiresAt };
    } catch {
      await this.prisma.authSession.delete({ where: { jti } });
      throw new InternalServerErrorException(
        'Unable to create authentication session',
      );
    }
  }

  async logout(userId: string, jti: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { userId, jti, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async changePassword(userId: string, input: PasswordChangeDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedException('Admin account not found');
    }

    if (!input.verificationCode) {
      if (
        !input.currentPassword ||
        !(await bcrypt.compare(input.currentPassword, user.password))
      ) {
        throw new UnauthorizedException('Current password is incorrect');
      }
      await this.sendActionCode(
        user.id,
        user.email,
        'PASSWORD_CHANGE',
        'password change',
      );
      return {
        message: 'A verification code has been sent to your email address',
      };
    }

    await this.consumeActionCode(
      user.id,
      'PASSWORD_CHANGE',
      input.verificationCode,
    );
    await this.finishPasswordChange(user.id, input.newPassword);
    return { message: 'Password changed successfully. Please log in again.' };
  }

  async resetPassword(input: PasswordResetDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: input.email, role: 'ADMIN' },
    });

    if (!input.verificationCode) {
      if (user) {
        await this.sendActionCode(
          user.id,
          user.email,
          'PASSWORD_RESET',
          'password reset',
        );
      }
      return {
        message:
          'If an admin account exists, a verification code has been sent',
      };
    }

    if (!user || !input.newPassword) {
      throw new BadRequestException(
        'A verification code and new password are required',
      );
    }
    await this.consumeActionCode(
      user.id,
      'PASSWORD_RESET',
      input.verificationCode,
    );
    await this.finishPasswordChange(user.id, input.newPassword);
    return { message: 'Password reset successfully. Please log in again.' };
  }

  private async sendActionCode(
    userId: string,
    email: string,
    purpose: string,
    mailPurpose: 'password change' | 'password reset',
  ): Promise<void> {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const tokenHash = this.hashToken(userId, purpose, code);
    const expiresAt = new Date(Date.now() + this.actionTokenLifetimeMs);

    await this.prisma.authActionToken.deleteMany({
      where: { userId, purpose },
    });
    await this.prisma.authActionToken.create({
      data: { userId, purpose, tokenHash, expiresAt },
    });
    try {
      await this.mail.sendVerificationCode(email, code, mailPurpose);
    } catch (error) {
      await this.prisma.authActionToken.deleteMany({
        where: { userId, purpose, tokenHash },
      });
      throw error;
    }
  }

  private async consumeActionCode(
    userId: string,
    purpose: string,
    code: string,
  ): Promise<void> {
    const token = await this.prisma.authActionToken.findUnique({
      where: { tokenHash: this.hashToken(userId, purpose, code) },
    });
    if (
      !token ||
      token.userId !== userId ||
      token.purpose !== purpose ||
      token.consumedAt ||
      token.expiresAt <= new Date()
    ) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    const consumed = await this.prisma.authActionToken.updateMany({
      where: { id: token.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    if (consumed.count !== 1) {
      throw new BadRequestException('Invalid or expired verification code');
    }
  }

  private async finishPasswordChange(
    userId: string,
    newPassword: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { password: await bcrypt.hash(newPassword, 12) },
      }),
      this.prisma.authSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  private hashToken(userId: string, purpose: string, value: string): string {
    return createHash('sha256')
      .update(`${userId}:${purpose}:${value}`)
      .digest('hex');
  }

  private parseDuration(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) {
      throw new InternalServerErrorException(
        'JWT_EXPIRES_IN must be a duration such as 15m',
      );
    }
    const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 } as const;
    return Number(match[1]) * units[match[2] as keyof typeof units];
  }
}
