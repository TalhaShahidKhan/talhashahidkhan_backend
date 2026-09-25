import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from './auth.guard.js';

export function AdminOnly() {
  return applyDecorators(UseGuards(AdminAuthGuard), ApiBearerAuth());
}
