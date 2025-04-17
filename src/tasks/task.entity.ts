import { ApiProperty } from '@nestjs/swagger';

export class Task {
  @ApiProperty({ example: '1234-uuid', description: 'ID de la tarea' })
  id: string;

  @ApiProperty({ example: 'Estudiar NestJS', description: 'Título de la tarea' })
  title: string;

  @ApiProperty({ example: 'Repasar decoradores y módulos', description: 'Descripción' })
  description: string;

  @ApiProperty({ example: false, description: '¿La tarea está completada?' })
  completed: boolean;

  @ApiProperty({ example: 'uid-del-usuario', description: 'ID del usuario dueño de la tarea' })
  userId: string;

  @ApiProperty({ example: 'https://storage.googleapis.com/bucket/file.pdf', required: false })
  pdfUrl?: string;
}
