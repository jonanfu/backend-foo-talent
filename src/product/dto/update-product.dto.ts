import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Nuevo nombre del producto' })
  nombre?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Descripción actualizada del producto' })
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2025-04-22T12:12:46.470Z' })
  fecha?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'https://storage.googleapis.com/...' })
  pdfUrl?: string;
}
