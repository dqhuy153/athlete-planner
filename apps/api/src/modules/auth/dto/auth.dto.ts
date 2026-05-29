import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}

