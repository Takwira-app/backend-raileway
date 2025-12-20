// src/auth/dto/google-auth.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @IsOptional()
  @IsString()
  @IsIn(['player', 'owner'])
  role?: string;
}