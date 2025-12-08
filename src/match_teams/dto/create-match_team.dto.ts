import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateMatchTeamDto {
  @IsInt()
  @Min(1)
  team_number: number;

  @IsOptional()
  @IsString()
  team_name?: string;
}
