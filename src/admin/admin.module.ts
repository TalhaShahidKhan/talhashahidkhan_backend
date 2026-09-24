import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { AdminAuthGuard } from './auth.guard.js';
import { MailService } from './mail.service.js';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AdminController],
  providers: [AdminService, AdminAuthGuard, MailService],
})
export class AdminModule {}
