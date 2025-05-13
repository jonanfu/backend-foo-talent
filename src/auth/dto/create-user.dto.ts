import {
  IsEmail, IsIn, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Matches, MinLength, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Correo electrónico del usuario (máximo 100 caracteres)',
  })
  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío.' })
  @IsEmail({}, { message: 'El correo electrónico ingresado no es válido.' })
  @MaxLength(100, { message: 'El correo electrónico no puede exceder 100 caracteres.' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
  })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Nombre completo del usuario (solo letras y espacios, máximo 50 caracteres)',
  })
  @IsNotEmpty({ message: 'El nombre completo no puede estar vacío.' })
  @IsString({ message: 'El nombre completo debe ser una cadena.' })
  @MaxLength(50, { message: 'El nombre completo no puede exceder 50 caracteres.' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'El nombre completo solo puede contener letras y espacios.',
  })
  displayName: string;

  @ApiProperty({ example: 'user', description: 'Role de usuario', enum: ['user', 'admin'] })
  @IsNotEmpty({ message: 'El role del usuario no debe de estar vacío' })
  @IsIn(['user', 'admin'], { message: 'Role inválido: solo puede ser "user" o "admin"' })
  role: string;

  @ApiProperty({
    example: '+5491123456789',
    description: 'Número de teléfono en formato internacional (máximo 15 dígitos)',
  })
  @IsNotEmpty({ message: 'El número de teléfono no puede estar vacío.' })
  @IsString({ message: 'El número de teléfono debe ser una cadena.' })
  @Matches(/^\+\d{1,14}$/, {
    message: 'El número de teléfono debe incluir el código de país y contener solo números.',
  })
  @MaxLength(15, { message: 'El número de teléfono no puede exceder 15 dígitos.' })
  phoneNumber: string;

  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'URL de la foto de perfil (Opcional)',
    required: false
  })
  @IsOptional()
  @Matches(/^https?:\/\/[^\s$.?#].[^\s]*$/, { message: 'URL de foto inválida.' })
  photoUrl?: string;

}