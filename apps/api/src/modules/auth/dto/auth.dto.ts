import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class GoogleAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  googleId: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

/**
 * Dev-only login DTO — never reaches production (endpoint throws 403 when NODE_ENV !== 'development').
 */
export class DevLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['FREE', 'PRO'])
  tier?: 'FREE' | 'PRO';
}

/**
 * Admin login DTO — validates against ROOT_ADMIN_EMAIL / ROOT_ADMIN_PASSWORD env vars.
 * Available in all environments.
 */
export class AdminLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

