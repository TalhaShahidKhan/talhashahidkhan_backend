import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class PasswordResetDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/)
  verificationCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;
}
