import { Module } from '@nestjs/common';
import { MailService } from '../admin/mail.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PublicController } from './public.controller.js';
import { PublicService } from './public.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [PublicController],
  providers: [PublicService, MailService],
})
export class PublicModule {}
