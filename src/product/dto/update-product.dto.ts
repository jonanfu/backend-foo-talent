import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  nombre?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ type: String, format: 'date-time' })
  fecha?: string;
}
