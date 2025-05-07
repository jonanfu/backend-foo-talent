import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  IsEnum,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../enums/application-status.enum';
import { Transform } from 'class-transformer';

export class CreateApplicationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  vacancyId: string;

  @ApiProperty()
  @IsNotEmpty({ message: "El nombre completo es requerido" })
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsNotEmpty({ message: "El correo no puede estar vacío" })
  @IsEmail({}, { message: "El campo debe de tener formato de email" })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: "El telefono no puede estar vacío" })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'URL del CV',
    example: 'https://example.com/cv.pdf'
  })
  @IsNotEmpty({ message: "La URL del CV es requerida" })
  @IsUrl({}, { message: "Debe ser una URL válida" })
  cvUrl: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value]; 
      }
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({
    type: 'string',
    description: 'Habilidades. Enviar como string JSON en Swagger o múltiples campos en frontend.',
    example: '"NestJS", "TypeScript"',
  })
  skills: string[];

  @ApiProperty({
    enum: Object.values(ApplicationStatus),
    default: ApplicationStatus.RECEIVED,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus, {
    message: `Status no válido. Opciones válidas: ${Object.values(ApplicationStatus).join(', ')}`
  })
  status: ApplicationStatus = ApplicationStatus.RECEIVED;

  @ApiProperty({ required: false, description: 'Date when the application was submitted' })
  @IsOptional()
  createdAt?: string;
}

