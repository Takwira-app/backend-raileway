// src/stadiums/dto/update-stadium-photos.dto.ts
import { IsArray, IsString } from 'class-validator';

export class UpdateStadiumPhotosDto {
  @IsArray()
  @IsString({ each: true })
  photos: string[];
}