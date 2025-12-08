import { IsDateString, IsInt, IsOptional,IsString, Matches } from 'class-validator';

export class CreateMatchDto {
  @IsInt()
  stadium_id: number;

  @IsString()
  match_date: string;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: 'start_time must be in HH:MM or HH:MM:SS format'
  })
  start_time: string;

  @IsInt()
  max_players: number;

  @IsOptional()
  @IsInt()
  duration_minutes?: number;
}
