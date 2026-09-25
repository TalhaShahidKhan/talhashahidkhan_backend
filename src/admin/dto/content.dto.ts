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
  Max,
  MaxLength,
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
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(50000)
  content!: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2000)
  imageUrl?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  slug!: string;

  @IsOptional()
  @IsEnum(PublicationStatus)
  status?: PublicationStatus;
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(50000)
  content?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2000)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  slug?: string;

  @IsOptional()
  @IsEnum(PublicationStatus)
  status?: PublicationStatus;
}

export class CreateServiceDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  slug!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  description!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  category!: string;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  tags!: string[];

  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(999999.99)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  deliveryDays!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  revisions!: number;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
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
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(999999.99)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  deliveryDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  revisions?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
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
  @MaxLength(100)
  serviceId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(999999.99)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  deliveryDays!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  revisions!: number;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  features!: string[];

  @IsOptional()
  @IsEnum(PublicationStatus)
  status?: PublicationStatus;
}

export class UpdateServicePackageDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serviceId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(999999.99)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  deliveryDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  revisions?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  features?: string[];

  @IsOptional()
  @IsEnum(PublicationStatus)
  status?: PublicationStatus;
}

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  description!: string;

  @IsArray()
  @IsUrl({}, { each: true })
  @MaxLength(2000, { each: true })
  images!: string[];

  @IsOptional()
  @IsUrl()
  @MaxLength(2000)
  liveLink?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2000)
  githubRepository?: string;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  tags!: string[];

  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  techStack!: string[];
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  @MaxLength(2000, { each: true })
  images?: string[];

  @IsOptional()
  @IsUrl()
  @MaxLength(2000)
  liveLink?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2000)
  githubRepository?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  techStack?: string[];
}

export class UpdateServiceRequestStatusDto {
  @IsEnum(ServiceRequestStatus)
  status!: ServiceRequestStatus;
}

export class CreateServiceRequestDto {
  @IsString()
  @MaxLength(100)
  serviceId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  packageId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  whatsapp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  message?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  additionalRequirements?: string[];
}

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  whatsapp?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message!: string;
}
