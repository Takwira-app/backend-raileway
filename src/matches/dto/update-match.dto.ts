import { IsDateString, IsInt, IsOptional } from 'class-validator';

export class UpdateMatchDto {
  @IsOptional()
  @IsInt()
  stadium_id?: number;

  @IsOptional()
  @IsDateString()
  match_date?: string;

  @IsOptional()
  @IsDateString()
  start_time?: string;

  @IsOptional()
  @IsInt()
  max_players?: number;

  @IsOptional()
  @IsInt()
  duration_minutes?: number;
}
