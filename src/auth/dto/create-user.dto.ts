import { IsEmail, IsIn, isNotEmpty, IsNotEmpty, IsOptional, IsPhoneNumber, MinLength,IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'test@example.com', description: 'Email del usuario' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña del usuario' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @MinLength(6, { message: 'Mínimo 6 caracteres' })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Nombre de Usuario'})
  @IsNotEmpty({ message: 'El nombre de usuario no debe de estar vacía'})
  displayName: string;

  @ApiProperty({ example: 'user', description: 'Role de usuario', enum: ['user', 'admin'] })
  @IsNotEmpty({ message: 'El role del usuario no debe de estar vacío' })
  @IsIn(['user', 'admin'], { message: 'Role inválido: solo puede ser "user" o "admin"' })
  role: string;

  @ApiProperty({ example: '+5491123456789', description: 'Número de teléfono del usuario', required: false })
  @IsNotEmpty({ message: 'El numero del usuario no debe de estar vacío' })
  @IsPhoneNumber( 'AR'  ,{ message: 'Formato de teléfono inválido' })
  phoneNumber: string;

  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'URL de la foto de perfil',
    required: false
  })
  @IsOptional()
  @IsUrl({}, { message: 'URL de foto inválida' })
  photoUrl?: string;

}