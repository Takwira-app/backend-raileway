import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { user_role } from 'generated/prisma/enums';

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(user_role)
  role: user_role; 
}
