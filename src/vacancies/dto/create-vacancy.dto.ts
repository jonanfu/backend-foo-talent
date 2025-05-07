import { IsNotEmpty, IsString, IsDateString, IsEnum, IsOptional, Length, Matches } from 'class-validator';

export enum VacancyStatus {
    ACTIVE = 'activo',
    COMPLETED = 'terminado',
    PAUSED = 'pausado',
    DRAFT = 'borrador',
    CANCELLED = 'cancelado',
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

    //NUEVOS CAMPOS
    @IsOptional()
    @IsString({ message: 'La ubicación debe ser una cadena' })
    ubicacion?: string;

    @IsOptional()
    @IsEnum(Modalidad, {
        message: `Modalidad no válida. Opciones: ${Object.values(Modalidad).join(', ')}`
    })
    modalidad?: Modalidad;

    @IsOptional()
    @IsEnum(Prioridad, {
        message: `Prioridad no válida. Opciones: ${Object.values(Prioridad).join(', ')}`
    })
    prioridad?: Prioridad;
}