// src/tasks/dto/update-task.dto.ts
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string;
}
