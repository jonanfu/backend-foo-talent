import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, isString, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({example:"user@example.com"})
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({example : "John doe"})
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ example: "img.jpg"})
  @IsOptional()
  @IsString()
  photoURL?: string;

  @ApiProperty({example: "+10020030011"})
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}
