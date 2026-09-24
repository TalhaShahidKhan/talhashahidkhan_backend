import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { AdminAuthGuard } from './auth.guard.js';
import type { AuthenticatedAdminRequest } from './auth.types.js';
import { LoginDto } from './dto/login.dto.js';
import { PasswordChangeDto } from './dto/password-change.dto.js';
import { PasswordResetDto } from './dto/password-reset.dto.js';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() input: LoginDto) {
    return this.adminService.login(input);
  }

  @Post('logout')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() request: AuthenticatedAdminRequest): Promise<void> {
    await this.adminService.logout(request.user.sub, request.user.jti);
  }

  @Post('password_change')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  passwordChange(
    @Req() request: AuthenticatedAdminRequest,
    @Body() input: PasswordChangeDto,
  ) {
    return this.adminService.changePassword(request.user.sub, input);
  }

  @Post('password_reset')
  @HttpCode(HttpStatus.OK)
  passwordReset(@Body() input: PasswordResetDto) {
    return this.adminService.resetPassword(input);
  }
}
