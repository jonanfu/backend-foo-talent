import { IsNotEmpty, IsString, IsDateString, IsEnum, IsOptional, Length, Matches } from 'class-validator';

export enum VacancyStatus {
    OPEN = 'abierta',
    CLOSED = 'cerrada',
    PAUSED = 'pausa',
}

export enum Modalidad {
    PRESENCIAL = 'presencial',
    REMOTO = 'remoto',
    HIBRIDO = 'híbrido',
}

export enum Prioridad {
    ALTA = 'alta',
    MEDIA = 'media',
    BAJA = 'baja',
}

export enum Jornada {
    COMPLETA = 'completa',
    MEDIO_TIEMPO = 'medio_tiempo',
}

export class CreateVacancyDto {
    @IsString()
    @IsNotEmpty({ message: 'El puesto es requerido' })
    puesto: string;

    @IsString()
    @IsNotEmpty({ message: 'La ubicación es requerida' })
    ubicacion: string;

    @IsEnum(Modalidad, {
        message: `Modalidad no válida. Opciones: ${Object.values(Modalidad).join(', ')}`
    })
    @IsNotEmpty({ message: 'La modalidad es requerida' })
    modalidad: Modalidad;

    @IsEnum(Prioridad, {
        message: `Prioridad no válida. Opciones: ${Object.values(Prioridad).join(', ')}`
    })
    @IsNotEmpty({ message: 'La prioridad es requerida' })
    prioridad: Prioridad;

    @IsEnum(VacancyStatus, {
        message: `Estado no válido. Opciones válidas: ${Object.values(VacancyStatus).join(', ')}`
    })
    @IsNotEmpty({ message: 'El estado es requerido' })
    estado: VacancyStatus;

    @IsString()
    @IsNotEmpty({ message: 'La descripción es requerida' })
    @Length(200, 2000, {
        message: 'La descripción debe tener entre 200 y 2000 caracteres'
    })
    @Matches(/^[^<>]*$/, {
        message: 'La descripción no debe contener etiquetas HTML ni scripts'
    })
    descripcion: string;

    @IsOptional()
    @IsEnum(Jornada, {
        message: `Jornada no válida. Opciones: ${Object.values(Jornada).join(', ')}`
    })
    jornada?: Jornada;

    @IsOptional()
    @IsString({ message: 'La experiencia debe ser una cadena' })
    experiencia?: string;

    @IsOptional()
    @IsString({ message: 'Las responsabilidades deben ser una cadena' })
    @Matches(/^[^<>]*$/, {
        message: 'Las responsabilidades no deben contener etiquetas HTML ni scripts'
    })
    responsabilidades?: string;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha debe tener formato válido (YYYY-MM-DD)' })
    fecha?: string;
}