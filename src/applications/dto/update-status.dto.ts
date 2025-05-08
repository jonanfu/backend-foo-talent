import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '../enums/application-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({
    enum: ApplicationStatus,
    description: 'Nuevo estado de la postulación',
  })
  @IsEnum(ApplicationStatus, {
    message: `Estado inválido. Valores permitidos: ${Object.values(ApplicationStatus).join(', ')}`,
  })
  status: ApplicationStatus;
}