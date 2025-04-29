import { IsNotEmpty, IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum VacancyStatus {
    ACTIVE = 'activo',
    COMPLETED = 'terminado',
    PAUSED = 'pausado',
    DRAFT = 'borrador',
    CANCELLED = 'cancelado',
}

export class CreateVacancyDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre es requerido' })
    nombre: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser texto' })
    descripcion?: string;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha debe tener formato válido (YYYY-MM-DD)' })
    fecha?: string;

    @IsOptional()
    @IsEnum(VacancyStatus, {
        message: `Estado no válido. Opciones válidas: ${Object.values(VacancyStatus).join(', ')}`
    })
    estado?: VacancyStatus;

    @IsOptional()
    @IsString()
    image?: string;
}