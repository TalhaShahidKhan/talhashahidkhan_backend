import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../admin/mail.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateContactDto,
  CreateServiceRequestDto,
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

    const packageRecord = input.packageId
      ? await this.prisma.servicePackage.findFirst({
          where: { id: input.packageId, serviceId: input.serviceId },
          select: {
            name: true,
            description: true,
            price: true,
            deliveryDays: true,
            revisions: true,
            features: true,
          },
        })
      : null;

    if (input.packageId && !packageRecord) {
      throw new BadRequestException(
        'The selected package does not belong to this service',
      );
    }

    const serviceRequest = await this.prisma.serviceRequest.create({
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
        package: packageRecord
          ? {
              ...packageRecord,
              price: packageRecord.price.toString(),
            }
          : undefined,
        message: serviceRequest.message ?? undefined,
        additionalRequirements: serviceRequest.additionalRequirements,
      }),
    );
    return serviceRequest;
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
