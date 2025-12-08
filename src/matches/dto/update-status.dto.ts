import { IsEnum, IsIn, IsString } from 'class-validator';
import { match_status } from 'generated/prisma/enums';

export class UpdateStatusDto {
  @IsEnum(match_status)
  status?: match_status;

  
}
