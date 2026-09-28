import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PublicationStatus } from '../../generated/prisma/client.js';
import { MailService } from '../admin/mail.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateContactDto,
  CreateServiceRequestDto,
  CreateServicePackageRequestDto,
} from './dto/public.dto.js';

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async listPublishedPosts() {
    return this.prisma.post.findMany({
      where: { status: PublicationStatus.PUBLISHED },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listPublishedServices() {
    return this.prisma.service.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listPublishedServicePackages() {
    return this.prisma.servicePackage.findMany({
      where: { status: 'PUBLISHED' },
    });
  }

  async listProjects() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async listExperiences() {
    return this.prisma.experience.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  async createContact(input: CreateContactDto) {
    const contact = await this.prisma.contact.create({
      data: {
        name: input.name,
        email: input.email,
        whatsapp: input.whatsapp,
        message: input.message,
      },
    });

    await this.sendConfirmationEmail('contact', () =>
      this.mail.sendContactConfirmation(contact.email, contact.name),
    );
    return contact;
  }

  async createServiceRequest(input: CreateServiceRequestDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: input.serviceId },
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        price: true,
        deliveryDays: true,
        revisions: true,
        features: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const serviceRequest = await this.prisma.serviceRequest.create({
      data: {
        serviceId: input.serviceId,
        name: input.name,
        email: input.email,
        whatsapp: input.whatsapp,
        message: input.message,
        additionalRequirements: input.additionalRequirements ?? [],
      },
    });

    await this.sendConfirmationEmail('service request', () =>
      this.mail.sendServiceRequestConfirmation(serviceRequest.email, {
        name: serviceRequest.name,
        service: {
          title: service.title,
          category: service.category,
          description: service.description,
          price: service.price.toString(),
          deliveryDays: service.deliveryDays,
          revisions: service.revisions,
          features: service.features,
        },
        message: serviceRequest.message ?? undefined,
        additionalRequirements: serviceRequest.additionalRequirements,
      }),
    );
    return serviceRequest;
  }

  async createServicePackageRequest(input: CreateServicePackageRequestDto) {
    const packageRecord = await this.prisma.servicePackage.findUnique({
      where: { id: input.packageId },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        deliveryDays: true,
        revisions: true,
        features: true,
      },
    });

    if (!packageRecord) {
      throw new NotFoundException('Service package not found');
    }

    const packageRequest = await this.prisma.servicePackageRequest.create({
      data: {
        packageId: input.packageId,
        name: input.name,
        email: input.email,
        whatsapp: input.whatsapp,
        message: input.message,
        additionalRequirements: input.additionalRequirements ?? [],
      },
    });

    await this.sendConfirmationEmail('service package request', () =>
      this.mail.sendServicePackageRequestConfirmation(packageRequest.email, {
        name: packageRequest.name,
        package: {
          name: packageRecord.name,
          description: packageRecord.description,
          price: packageRecord.price.toString(),
          deliveryDays: packageRecord.deliveryDays,
          revisions: packageRecord.revisions,
          features: packageRecord.features,
        },
        message: packageRequest.message ?? undefined,
        additionalRequirements: packageRequest.additionalRequirements,
      }),
    );
    return packageRequest;
  }

  private async sendConfirmationEmail(
    type: string,
    send: () => Promise<void>,
  ): Promise<void> {
    try {
      await send();
    } catch (error) {
      this.logger.error(
        `Could not send ${type} confirmation email`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
