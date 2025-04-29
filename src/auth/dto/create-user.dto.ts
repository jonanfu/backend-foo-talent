import { IsEmail, isNotEmpty, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
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

  @ApiProperty({ example: 'user', description: 'Role de usuario'})
  @IsNotEmpty({ message: 'El role del usuario no debe de estar vacio'})
  @IsNotEmpty()
  role: string;
}