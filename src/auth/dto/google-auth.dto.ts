import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { user_role } from 'generated/prisma/enums';

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  idToken: string; // Firebase ID token from client

  @IsEnum(user_role)
  role: user_role; // Required for first-time registration
}

