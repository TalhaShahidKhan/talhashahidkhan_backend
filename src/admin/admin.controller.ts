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
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from './admin-only.decorator.js';
import { AdminService } from './admin.service.js';
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
@ApiTags('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in as an administrator' })
  login(@Body() input: LoginDto) {
    return this.adminService.login(input);
  }

  @Post('logout')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current admin session' })
  async logout(@Req() request: AuthenticatedAdminRequest): Promise<void> {
    await this.adminService.logout(request.user.sub, request.user.jti);
  }

  @Post('password_change')
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request a verification code or change the admin password',
  })
  passwordChange(
    @Req() request: AuthenticatedAdminRequest,
    @Body() input: PasswordChangeDto,
  ) {
    return this.adminService.changePassword(request.user.sub, input);
  }

  @Post('password_reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request a password reset code or reset the admin password',
  })
  passwordReset(@Body() input: PasswordResetDto) {
    return this.adminService.resetPassword(input);
  }

  @Get('posts')
  @AdminOnly()
  @ApiOperation({ summary: 'List all posts, including drafts' })
  findAllPosts() {
    return this.adminService.findAllPosts();
  }

  @Get('posts/:id')
  @AdminOnly()
  @ApiOperation({ summary: 'Get a post by ID' })
  findPostById(@Param('id') id: string) {
    return this.adminService.findPostById(id);
  }

  @Post('posts')
  @AdminOnly()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a post' })
  createPost(
    @Req() request: AuthenticatedAdminRequest,
    @Body() input: CreatePostDto,
  ) {
    return this.adminService.createPost(input, request.user.sub);
  }

  @Patch('posts/:id')
  @AdminOnly()
  @ApiOperation({ summary: 'Update a post' })
  updatePost(@Param('id') id: string, @Body() input: UpdatePostDto) {
    return this.adminService.updatePost(id, input);
  }

  @Delete('posts/:id')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a post' })
  async deletePost(@Param('id') id: string): Promise<void> {
    await this.adminService.deletePost(id);
  }

  @Get('services')
  @AdminOnly()
  @ApiOperation({ summary: 'List all services and their packages' })
  findAllServices() {
    return this.adminService.findAllServices();
  }

  @Get('services/:id')
  @AdminOnly()
  @ApiOperation({ summary: 'Get a service by ID' })
  findServiceById(@Param('id') id: string) {
    return this.adminService.findServiceById(id);
  }

  @Post('services')
  @AdminOnly()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a service' })
  createService(@Body() input: CreateServiceDto) {
    return this.adminService.createService(input);
  }

  @Patch('services/:id')
  @AdminOnly()
  @ApiOperation({ summary: 'Update a service' })
  updateService(@Param('id') id: string, @Body() input: UpdateServiceDto) {
    return this.adminService.updateService(id, input);
  }

  @Delete('services/:id')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a service' })
  async deleteService(@Param('id') id: string): Promise<void> {
    await this.adminService.deleteService(id);
  }

  @Get('service-packages')
  @AdminOnly()
  @ApiOperation({ summary: 'List service packages' })
  findAllServicePackages() {
    return this.adminService.findAllServicePackages();
  }

  @Get('service-packages/:id')
  @AdminOnly()
  @ApiOperation({ summary: 'Get a service package by ID' })
  findServicePackageById(@Param('id') id: string) {
    return this.adminService.findServicePackageById(id);
  }

  @Post('service-packages')
  @AdminOnly()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a service package' })
  createServicePackage(@Body() input: CreateServicePackageDto) {
    return this.adminService.createServicePackage(input);
  }

  @Patch('service-packages/:id')
  @AdminOnly()
  @ApiOperation({ summary: 'Update a service package' })
  updateServicePackage(
    @Param('id') id: string,
    @Body() input: UpdateServicePackageDto,
  ) {
    return this.adminService.updateServicePackage(id, input);
  }

  @Delete('service-packages/:id')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a service package' })
  async deleteServicePackage(@Param('id') id: string): Promise<void> {
    await this.adminService.deleteServicePackage(id);
  }

  @Get('projects')
  @AdminOnly()
  @ApiOperation({ summary: 'List portfolio projects' })
  findAllProjects() {
    return this.adminService.findAllProjects();
  }

  @Get('projects/:id')
  @AdminOnly()
  @ApiOperation({ summary: 'Get a project by ID' })
  findProjectById(@Param('id') id: string) {
    return this.adminService.findProjectById(id);
  }

  @Post('projects')
  @AdminOnly()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a project' })
  createProject(@Body() input: CreateProjectDto) {
    return this.adminService.createProject(input);
  }

  @Patch('projects/:id')
  @AdminOnly()
  @ApiOperation({ summary: 'Update a project' })
  updateProject(@Param('id') id: string, @Body() input: UpdateProjectDto) {
    return this.adminService.updateProject(id, input);
  }

  @Delete('projects/:id')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project' })
  async deleteProject(@Param('id') id: string): Promise<void> {
    await this.adminService.deleteProject(id);
  }

  @Get('service-requests')
  @AdminOnly()
  @ApiOperation({ summary: 'List service requests' })
  findAllServiceRequests() {
    return this.adminService.findAllServiceRequests();
  }

  @Get('service-requests/:id')
  @AdminOnly()
  @ApiOperation({ summary: 'Get a service request by ID' })
  findServiceRequestById(@Param('id') id: string) {
    return this.adminService.findServiceRequestById(id);
  }

  @Patch('service-requests/:id/status')
  @AdminOnly()
  @ApiOperation({ summary: 'Update a service request status' })
  updateServiceRequestStatus(
    @Param('id') id: string,
    @Body() input: UpdateServiceRequestStatusDto,
  ) {
    return this.adminService.updateServiceRequestStatus(id, input);
  }

  @Get('contacts')
  @AdminOnly()
  @ApiOperation({ summary: 'List contact submissions' })
  findAllContacts() {
    return this.adminService.findAllContacts();
  }
}
