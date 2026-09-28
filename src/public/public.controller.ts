import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateContactDto, CreateServiceRequestDto, CreateServicePackageRequestDto } from './dto/public.dto.js';
import { PublicService } from './public.service.js';

@Controller()
@ApiTags('Public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('posts')
  @ApiOperation({ summary: 'List published posts' })
  async getPosts() {
    return this.publicService.listPublishedPosts();
  }

  @Get('services')
  @ApiOperation({ summary: 'List published services' })
  async getServices() {
    return this.publicService.listPublishedServices();
  }

  @Get('service-packages')
  @ApiOperation({ summary: 'List published service packages' })
  async getServicePackages() {
    return this.publicService.listPublishedServicePackages();
  }

  @Get('projects')
  @ApiOperation({ summary: 'List portfolio projects' })
  async getProjects() {
    return this.publicService.listProjects();
  }

  @Get('experiences')
  @ApiOperation({ summary: 'List portfolio experiences' })
  async getExperiences() {
    return this.publicService.listExperiences();
  }

  @Post('contacts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a contact message' })
  async createContact(@Body() input: CreateContactDto) {
    return this.publicService.createContact(input);
  }

  @Post('service-requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a service request' })
  async createServiceRequest(@Body() input: CreateServiceRequestDto) {
    return this.publicService.createServiceRequest(input);
  }

  @Post('service-package-requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a service package request' })
  async createServicePackageRequest(@Body() input: CreateServicePackageRequestDto) {
    return this.publicService.createServicePackageRequest(input);
  }
}
