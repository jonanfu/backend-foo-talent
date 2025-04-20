// src/tasks/dto/create-task.dto.ts
import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  descripcion: string;

  @IsDateString()
  fecha: string;
}
