import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { AdminAuthGuard } from './auth.guard.js';
import { MailService } from './mail.service.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  imports: [JwtModule.register({}), forwardRef(() => CloudinaryModule)],
  controllers: [AdminController],
  providers: [AdminService, AdminAuthGuard, MailService],
  exports: [JwtModule, AdminAuthGuard],
})
export class AdminModule {}
