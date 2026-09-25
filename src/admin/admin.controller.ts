import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { AdminAuthGuard } from './auth.guard.js';
import type { AuthenticatedAdminRequest } from './auth.types.js';
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

  @Get('posts')
  @UseGuards(AdminAuthGuard)
  findAllPosts() {
    return this.adminService.findAllPosts();
  }

  @Get('posts/:id')
  @UseGuards(AdminAuthGuard)
  findPostById(@Param('id') id: string) {
    return this.adminService.findPostById(id);
  }

  @Post('posts')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createPost(
    @Req() request: AuthenticatedAdminRequest,
    @Body() input: CreatePostDto,
  ) {
    return this.adminService.createPost(input, request.user.sub);
  }

  @Patch('posts/:id')
  @UseGuards(AdminAuthGuard)
  updatePost(@Param('id') id: string, @Body() input: UpdatePostDto) {
    return this.adminService.updatePost(id, input);
  }

  @Delete('posts/:id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string): Promise<void> {
    await this.adminService.deletePost(id);
  }

  @Get('services')
  @UseGuards(AdminAuthGuard)
  findAllServices() {
    return this.adminService.findAllServices();
  }

  @Get('services/:id')
  @UseGuards(AdminAuthGuard)
  findServiceById(@Param('id') id: string) {
    return this.adminService.findServiceById(id);
  }

  @Post('services')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createService(@Body() input: CreateServiceDto) {
    return this.adminService.createService(input);
  }

  @Patch('services/:id')
  @UseGuards(AdminAuthGuard)
  updateService(@Param('id') id: string, @Body() input: UpdateServiceDto) {
    return this.adminService.updateService(id, input);
  }

  @Delete('services/:id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteService(@Param('id') id: string): Promise<void> {
    await this.adminService.deleteService(id);
  }

  @Get('service-packages')
  @UseGuards(AdminAuthGuard)
  findAllServicePackages() {
    return this.adminService.findAllServicePackages();
  }

  @Get('service-packages/:id')
  @UseGuards(AdminAuthGuard)
  findServicePackageById(@Param('id') id: string) {
    return this.adminService.findServicePackageById(id);
  }

  @Post('service-packages')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createServicePackage(@Body() input: CreateServicePackageDto) {
    return this.adminService.createServicePackage(input);
  }

  @Patch('service-packages/:id')
  @UseGuards(AdminAuthGuard)
  updateServicePackage(
    @Param('id') id: string,
    @Body() input: UpdateServicePackageDto,
  ) {
    return this.adminService.updateServicePackage(id, input);
  }

  @Delete('service-packages/:id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteServicePackage(@Param('id') id: string): Promise<void> {
    await this.adminService.deleteServicePackage(id);
  }

  @Get('projects')
  @UseGuards(AdminAuthGuard)
  findAllProjects() {
    return this.adminService.findAllProjects();
  }

  @Get('projects/:id')
  @UseGuards(AdminAuthGuard)
  findProjectById(@Param('id') id: string) {
    return this.adminService.findProjectById(id);
  }

  @Post('projects')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createProject(@Body() input: CreateProjectDto) {
    return this.adminService.createProject(input);
  }

  @Patch('projects/:id')
  @UseGuards(AdminAuthGuard)
  updateProject(@Param('id') id: string, @Body() input: UpdateProjectDto) {
    return this.adminService.updateProject(id, input);
  }

  @Delete('projects/:id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProject(@Param('id') id: string): Promise<void> {
    await this.adminService.deleteProject(id);
  }

  @Get('service-requests')
  @UseGuards(AdminAuthGuard)
  findAllServiceRequests() {
    return this.adminService.findAllServiceRequests();
  }

  @Get('service-requests/:id')
  @UseGuards(AdminAuthGuard)
  findServiceRequestById(@Param('id') id: string) {
    return this.adminService.findServiceRequestById(id);
  }

  @Patch('service-requests/:id/status')
  @UseGuards(AdminAuthGuard)
  updateServiceRequestStatus(
    @Param('id') id: string,
    @Body() input: UpdateServiceRequestStatusDto,
  ) {
    return this.adminService.updateServiceRequestStatus(id, input);
  }

  @Get('contacts')
  @UseGuards(AdminAuthGuard)
  findAllContacts() {
    return this.adminService.findAllContacts();
  }
}
