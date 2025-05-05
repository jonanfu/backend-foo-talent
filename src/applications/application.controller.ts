import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors,
  UploadedFile, Query, Req,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBearerAuth, ApiTags, ApiBody, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FindAllApplicationsDto } from './dto/find-all-applications.dto';

@ApiTags('Applications')
@ApiBearerAuth('access-token')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Crea una nueva postulación',
    schema: {
      type: 'object',
      properties: {
        vacancyId: { type: 'string' },
        fullName: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: {type: 'string'},
        birthDate: { type: 'string', format: 'date' },
        skills: {
          type: 'string',
          description: 'JSON string con lista de habilidades (solo para Swagger)',
          example: '["NestJS", "TypeScript", "SQL"]',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Crear una aplicacion de trabajo con CV' })
  @ApiResponse({ status: 201, description: 'Aplicación creada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(
    @Body() dto: CreateApplicationDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    return this.applicationService.create(dto, file);
  }

  @Get()
  @ApiOperation({ summary: "Retorna las aplicaciones de una vacante"})
  @ApiResponse({ status: 200, description: 'Postulaciones listadas' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll(@Query() query: FindAllApplicationsDto) {
    const { vacancyId, status, page = '1', limit = '10' } = query;
    return this.applicationService.findAll(vacancyId, status, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: "Retorna el detalle de una aplicación"})
  @ApiParam({ name: 'id', description: 'ID de la vacante' })
  @ApiResponse({ status: 200, description: 'Aplicación encontrada' })
  @ApiResponse({ status: 404, description: 'Aplicación no encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.applicationService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de una postulación' })
  @ApiParam({ name: 'id', description: 'ID de la postulación' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.applicationService.updateStatus(id, dto.status);
  }
}
