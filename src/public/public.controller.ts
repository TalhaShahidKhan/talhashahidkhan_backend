import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateContactDto, CreateServiceRequestDto } from './dto/public.dto.js';
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
  @ApiOperation({ summary: 'List published services and packages' })
  async getServices() {
    return this.publicService.listPublishedServices();
  }

  @Get('projects')
  @ApiOperation({ summary: 'List portfolio projects' })
  async getProjects() {
    return this.publicService.listProjects();
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
}
