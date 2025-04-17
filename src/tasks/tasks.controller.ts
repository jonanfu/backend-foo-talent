import {
    Controller,
    NotFoundException,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Req,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
  import { TasksService } from './tasks.service';
  import { Task } from './task.entity';
  import { AuthGuard } from '@nestjs/passport';
  import { FileInterceptor } from '@nestjs/platform-express';
  import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiConsumes,
    ApiBody,
    ApiParam,
  } from '@nestjs/swagger';
  import { CreateTaskDto } from './dto/create-task.dto';
  import { UpdateTaskDto } from './dto/update-task.dto';
  import * as fs from 'fs';
  import { AuthService } from '../auth/auth.service';
  
  @ApiTags('Tasks')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('firebase'))
  @Controller('tasks')
  export class TasksController {
    constructor(private tasksService: TasksService, private authService: AuthService) {}
  
    @Get()
    @ApiOperation({ summary: 'Obtener todas las tareas del usuario' })
    @ApiResponse({ status: 200, description: 'Lista de tareas', type: [Task] })
    getTasks(@Req() req): Task[] {
      return this.tasksService.findAll(req.user.uid);
    }
  
    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @UseInterceptors(FileInterceptor('pdf'))
    @ApiOperation({ summary: 'Crear nueva tarea' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: CreateTaskDto })
    async createTask(@Req() req, @Body() body: CreateTaskDto, @UploadedFile() file): Promise<Task> {
      let pdfUrl: string | undefined;
  
      if (file) {
        const firebaseFile = this.authService.getStorage().file(file.originalname);
        await this.authService.getStorage().upload(file.path, {
          destination: file.originalname,
          public: true,
        });
        pdfUrl = `https://storage.googleapis.com/${this.authService.getStorage().name}/${file.originalname}`;
        fs.unlinkSync(file.path);
      }
  
      return this.tasksService.create({
        ...body,
        userId: req.user.uid,
        pdfUrl,
      });
    }
  
    @Put(':id')
@ApiOperation({ summary: 'Actualizar tarea' })
@ApiParam({ name: 'id', description: 'ID de la tarea' })
@ApiResponse({ status: 200, description: 'Tarea actualizada', type: Task })
@UsePipes(new ValidationPipe({ whitelist: true }))
updateTask(@Req() req, @Param('id') id: string, @Body() body: UpdateTaskDto): Task {
  const updated = this.tasksService.update(id, req.user.uid, body);

  if (!updated) {
    throw new NotFoundException(`Tarea con id ${id} no encontrada o no pertenece al usuario`);
  }

  return updated;
}
  
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar tarea' })
    @ApiParam({ name: 'id', description: 'ID de la tarea' })
    @ApiResponse({ status: 200, description: 'Tarea eliminada' })
    deleteTask(@Req() req, @Param('id') id: string): boolean {
      return this.tasksService.delete(id, req.user.uid);
    }
  }
  
