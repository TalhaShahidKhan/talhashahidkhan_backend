import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ServiceRequestStatus } from '../../../generated/prisma/client.js';

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

export class UpdateServiceRequestStatusDto {
  @IsEnum(ServiceRequestStatus)
  status!: ServiceRequestStatus;
}

export class ServiceRequestFilterDto {
  @IsOptional()
  @IsEnum(ServiceRequestStatus)
  status?: ServiceRequestStatus;
}
