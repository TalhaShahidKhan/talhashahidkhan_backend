import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { createHash, randomInt, randomUUID } from 'node:crypto';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AdminTokenPayload } from './auth.types.js';
import {
  CreatePostDto,
  CreateProjectDto,
  CreateServiceDto,
  CreateServicePackageDto,
  UpdatePostDto,
  UpdateProjectDto,
  UpdateServiceDto,
  UpdateServicePackageDto,
  UpdateServiceRequestStatusDto,
} from './dto/content.dto.js';
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

  async findAllPosts() {
    return this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPostById(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async createPost(input: CreatePostDto, authorId?: string) {
    if (!authorId) {
      throw new UnauthorizedException('Admin user context is required');
    }

    try {
      return await this.prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          imageUrl: input.imageUrl,
          slug: input.slug,
          authorId,
          status: input.status ?? 'DRAFT',
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'Post');
    }
  }

  async updatePost(id: string, input: UpdatePostDto) {
    await this.findPostById(id);

    try {
      return await this.prisma.post.update({
        where: { id },
        data: {
          ...input,
          status: input.status ?? undefined,
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'Post');
    }
  }

  async deletePost(id: string): Promise<void> {
    await this.findPostById(id);

    try {
      await this.prisma.post.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, 'Post');
    }
  }

  async findAllServices() {
    return this.prisma.service.findMany({
      include: { servicePackages: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findServiceById(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { servicePackages: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async createService(input: CreateServiceDto) {
    try {
      return await this.prisma.service.create({
        data: {
          title: input.title,
          slug: input.slug,
          description: input.description,
          category: input.category,
          tags: input.tags,
          price: input.price,
          deliveryDays: input.deliveryDays,
          revisions: input.revisions,
          features: input.features,
          status: input.status ?? 'DRAFT',
          isFeatured: input.isFeatured ?? false,
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'Service');
    }
  }

  async updateService(id: string, input: UpdateServiceDto) {
    await this.findServiceById(id);

    try {
      return await this.prisma.service.update({
        where: { id },
        data: {
          ...input,
          status: input.status ?? undefined,
          isFeatured: input.isFeatured ?? undefined,
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'Service');
    }
  }

  async deleteService(id: string): Promise<void> {
    await this.findServiceById(id);

    try {
      await this.prisma.service.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, 'Service');
    }
  }

  async findAllServicePackages() {
    return this.prisma.servicePackage.findMany({
      include: { service: true },
      orderBy: { serviceId: 'asc' },
    });
  }

  async findServicePackageById(id: string) {
    const packageItem = await this.prisma.servicePackage.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!packageItem) {
      throw new NotFoundException('Service package not found');
    }

    return packageItem;
  }

  async createServicePackage(input: CreateServicePackageDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: input.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    try {
      return await this.prisma.servicePackage.create({
        data: {
          serviceId: input.serviceId,
          name: input.name,
          description: input.description,
          price: input.price,
          deliveryDays: input.deliveryDays,
          revisions: input.revisions,
          features: input.features,
          status: input.status ?? 'DRAFT',
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'Service package');
    }
  }

  async updateServicePackage(id: string, input: UpdateServicePackageDto) {
    await this.findServicePackageById(id);

    if (input.serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: input.serviceId },
      });

      if (!service) {
        throw new NotFoundException('Service not found');
      }
    }

    try {
      return await this.prisma.servicePackage.update({
        where: { id },
        data: {
          ...input,
          status: input.status ?? undefined,
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'Service package');
    }
  }

  async deleteServicePackage(id: string): Promise<void> {
    await this.findServicePackageById(id);

    try {
      await this.prisma.servicePackage.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, 'Service package');
    }
  }

  async findAllProjects() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findProjectById(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async createProject(input: CreateProjectDto) {
    try {
      return await this.prisma.project.create({
        data: {
          name: input.name,
          description: input.description,
          images: input.images,
          liveLink: input.liveLink,
          githubRepository: input.githubRepository,
          tags: input.tags,
          techStack: input.techStack,
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'Project');
    }
  }

  async updateProject(id: string, input: UpdateProjectDto) {
    await this.findProjectById(id);

    try {
      return await this.prisma.project.update({
        where: { id },
        data: {
          ...input,
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'Project');
    }
  }

  async deleteProject(id: string): Promise<void> {
    await this.findProjectById(id);

    try {
      await this.prisma.project.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error, 'Project');
    }
  }

  async findAllServiceRequests() {
    return this.prisma.serviceRequest.findMany({
      include: { service: true, package: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findServiceRequestById(id: string) {
    const serviceRequest = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: { service: true, package: true },
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }

    return serviceRequest;
  }

  async updateServiceRequestStatus(
    id: string,
    input: UpdateServiceRequestStatusDto,
  ) {
    await this.findServiceRequestById(id);

    try {
      return await this.prisma.serviceRequest.update({
        where: { id },
        data: { status: input.status },
      });
    } catch (error) {
      this.handlePrismaError(error, 'Service request');
    }
  }

  async findAllContacts() {
    return this.prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
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

  private handlePrismaError(error: unknown, resource: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ConflictException(`${resource} already exists`);
        case 'P2003':
        case 'P2014':
          throw new BadRequestException(
            `Invalid ${resource.toLowerCase()} reference`,
          );
        case 'P2025':
          throw new NotFoundException(`${resource} not found`);
        default:
          throw new InternalServerErrorException(
            `Unable to process ${resource.toLowerCase()}`,
          );
      }
    }

    throw error;
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
