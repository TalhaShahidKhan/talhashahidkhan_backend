import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateContactDto,
  CreateServiceRequestDto,
} from './dto/public.dto.js';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublishedPosts() {
    return this.prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listPublishedServices() {
    return this.prisma.service.findMany({
      where: { status: 'PUBLISHED' },
      include: { servicePackages: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listProjects() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createContact(input: CreateContactDto) {
    return this.prisma.contact.create({
      data: {
        name: input.name,
        email: input.email,
        whatsapp: input.whatsapp,
        message: input.message,
      },
    });
  }

  async createServiceRequest(input: CreateServiceRequestDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: input.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (input.packageId) {
      const packageRecord = await this.prisma.servicePackage.findFirst({
        where: { id: input.packageId, serviceId: input.serviceId },
      });

      if (!packageRecord) {
        throw new BadRequestException(
          'The selected package does not belong to this service',
        );
      }
    }

    return this.prisma.serviceRequest.create({
      data: {
        serviceId: input.serviceId,
        packageId: input.packageId,
        name: input.name,
        email: input.email,
        whatsapp: input.whatsapp,
        message: input.message,
        additionalRequirements: input.additionalRequirements ?? [],
      },
    });
  }
}
