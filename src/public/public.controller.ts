import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CreateContactDto, CreateServiceRequestDto } from './dto/public.dto.js';
import { PublicService } from './public.service.js';

@Controller()
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('posts')
  async getPosts() {
    return this.publicService.listPublishedPosts();
  }

  @Get('services')
  async getServices() {
    return this.publicService.listPublishedServices();
  }

  @Get('projects')
  async getProjects() {
    return this.publicService.listProjects();
  }

  @Post('contacts')
  @HttpCode(HttpStatus.CREATED)
  async createContact(@Body() input: CreateContactDto) {
    return this.publicService.createContact(input);
  }

  @Post('service-requests')
  @HttpCode(HttpStatus.CREATED)
  async createServiceRequest(@Body() input: CreateServiceRequestDto) {
    return this.publicService.createServiceRequest(input);
  }
}
