import { IsEmail, IsEnum, IsString, MinLength, Matches } from 'class-validator';
import { user_role } from '../../../generated/prisma/enums';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name can only contain letters and spaces'
  })
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter and one number'
  })
  password: string;

  @IsEnum(user_role, { 
    message: `Role must be either ${user_role.player} or ${user_role.owner}` 
  })
  role: user_role;
}