import { IsEnum } from 'class-validator';
import { stadium_status } from 'generated/prisma/enums';

export class UpdateStadiumStatusDto {
  @IsEnum(stadium_status)
  status: stadium_status;
}
