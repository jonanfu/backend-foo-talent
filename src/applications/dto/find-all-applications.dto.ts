// src/applications/dto/find-all-applications.dto.ts
import { IsEnum, IsOptional, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../enums/application-status.enum';

export class FindAllApplicationsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vacancyId: string;

  @ApiPropertyOptional({ enum: ApplicationStatus, description: 'Filtrar por estado de la aplicación' })
  @IsOptional()
  @IsEnum(ApplicationStatus, {
    message: `Estado inválido. Valores permitidos: ${Object.values(ApplicationStatus).join(', ')}`,
  })
  status?: ApplicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
