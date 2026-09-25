import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ServiceRequestStatus } from '../../../generated/prisma/client.js';

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

export class UpdateServiceRequestStatusDto {
  @IsEnum(ServiceRequestStatus)
  status!: ServiceRequestStatus;
}

export class ServiceRequestFilterDto {
  @IsOptional()
  @IsEnum(ServiceRequestStatus)
  status?: ServiceRequestStatus;
}
