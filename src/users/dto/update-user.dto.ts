import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Nuevo email del usuario',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Nuevo nombre para mostrar',
    required: false
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({
    example: 'https://storage.googleapis.com/reclutamiento-12537.firebasestorage.app/default-avatars/default-avatar.png',
    description: 'URL de la foto de perfil',
    required: false
  })
  @IsOptional()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  photoUrl?: string;

  @ApiProperty({
    example: '+10020030011',
    description: 'Nuevo número de teléfono',
    required: false
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    example: false,
    description: 'Indica si el usuario está deshabilitado',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}