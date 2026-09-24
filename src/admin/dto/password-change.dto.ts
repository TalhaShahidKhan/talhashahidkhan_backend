import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class PasswordChangeDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  currentPassword?: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/)
  verificationCode?: string;
}
