import { IsString, IsInt, IsNumber, IsEnum, IsNotEmpty } from 'class-validator';
import { stadium_status } from 'generated/prisma/enums';

export class CreateStadiumDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  price_per_match: number;

  @IsInt()
  capacity: number;

  @IsEnum(stadium_status)
  status: stadium_status;
}
