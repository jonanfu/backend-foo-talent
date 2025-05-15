import { IsOptional, IsEnum, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../enums/application-status.enum';

export class FindAllApplicationsGlobalDto {
    @ApiProperty({
        description: 'Estado de la aplicación (opcional)',
        enum: ApplicationStatus,
        required: false,
    })
    @IsOptional()
    @IsEnum(ApplicationStatus, { message: 'Estado inválido' })
    status?: ApplicationStatus;

    @ApiProperty({
        description: 'Número de página (mínimo 1)',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsNumberString({}, { message: 'La página debe ser un número' })
    page?: string;

    @ApiProperty({
        description: 'Tamaño de página (mínimo 1)',
        example: 10,
        required: false,
    })
    @IsOptional()
    @IsNumberString({}, { message: 'El límite debe ser un número' })
    limit?: string;
}