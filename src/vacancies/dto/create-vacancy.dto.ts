import { IsNotEmpty, IsString, IsDateString, IsEnum, IsOptional, Length, Matches } from 'class-validator';

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
    @Length(200, 2000, {
        message: 'La descripción debe tener entre 200 y 2000 caracteres'
    })
    @Matches(/^[^<>]*$/, {
        message: 'La descripción no debe contener etiquetas HTML ni scripts'
    })
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