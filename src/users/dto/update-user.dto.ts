import { IsEmail, IsEnum, IsString, MinLength, Matches, IsOptional } from 'class-validator';
import { user_role } from '../../../generated/prisma/enums';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name can only contain letters and spaces'
  })
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

}