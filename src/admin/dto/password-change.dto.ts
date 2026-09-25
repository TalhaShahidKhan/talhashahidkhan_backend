import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class PasswordChangeDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  currentPassword?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/, {
    message:
      'newPassword must contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
  })
  newPassword!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/)
  verificationCode?: string;
}
