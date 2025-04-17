import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Estudiar NestJS' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Repasar decorators y servicios' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  completed: boolean;
}