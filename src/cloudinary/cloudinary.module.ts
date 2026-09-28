import { Module, forwardRef } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider.js';
import { CloudinaryService } from './cloudinary.service.js';
import { CloudinaryController } from './cloudinary.controller.js';
import { AdminModule } from '../admin/admin.module.js';

@Module({
  imports: [forwardRef(() => AdminModule)],
  controllers: [CloudinaryController],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
