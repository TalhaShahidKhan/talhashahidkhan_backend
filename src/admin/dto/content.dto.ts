import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';
import {
  PublicationStatus,
  ServiceRequestStatus,
} from '../../../generated/prisma/client.js';

export class CreatePostDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  content!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString()
  @MinLength(3)
  slug!: string;

  @IsOptional()
  @IsEnum(PublicationStatus)
  status?: PublicationStatus;
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  slug?: string;

  @IsOptional()
  @IsEnum(PublicationStatus)
  status?: PublicationStatus;
}

export class CreateServiceDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(3)
  slug!: string;

  @IsString()
  @MinLength(20)
  description!: string;

  @IsString()
  @MinLength(2)
  category!: string;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  deliveryDays!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  revisions!: number;

  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @IsOptional()
  @IsEnum(PublicationStatus)
  status?: PublicationStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  deliveryDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  revisions?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsEnum(PublicationStatus)
  status?: PublicationStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class CreateServicePackageDto {
  @IsString()
  serviceId!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  deliveryDays!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  revisions!: number;

  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @IsOptional()
  @IsEnum(PublicationStatus)
  status?: PublicationStatus;
}

export class UpdateServicePackageDto {
  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  deliveryDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  revisions?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsEnum(PublicationStatus)
  status?: PublicationStatus;
}

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(20)
  description!: string;

  @IsArray()
  @IsString({ each: true })
  images!: string[];

  @IsOptional()
  @IsUrl()
  liveLink?: string;

  @IsOptional()
  @IsUrl()
  githubRepository?: string;

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsArray()
  @IsString({ each: true })
  techStack!: string[];
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsUrl()
  liveLink?: string;

  @IsOptional()
  @IsUrl()
  githubRepository?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  techStack?: string[];
}

export class UpdateServiceRequestStatusDto {
  @IsEnum(ServiceRequestStatus)
  status!: ServiceRequestStatus;
}

export class CreateServiceRequestDto {
  @IsString()
  serviceId!: string;

  @IsOptional()
  @IsString()
  packageId?: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalRequirements?: string[];
}

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsString()
  @MinLength(10)
  message!: string;
}
