import {
  Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors,
  UploadedFile, Query, Req, UseGuards
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
  @ApiOperation({ summary: 'Crear una aplicación de trabajo con URL de CV' })
  @ApiResponse({ status: 201, description: 'Aplicación creada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBody({
    type: CreateApplicationDto,
    description: 'Crea una nueva postulación con URL de CV',
    examples: {
      ejemplo1: {
        summary: 'Aplicación básica',
        value: {
          vacancyId: "vac123",
          fullName: "María González",
          email: "maria@example.com",
          phone: "+51987654321",
          cvUrl: "https://bucket.example.com/cv_maria.pdf",
          status: "Recibido"
        }
      }
    }
  })
  create(
    @Body() dto: CreateApplicationDto,
    @Req() req: any
  ) {
    return this.applicationService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Retorna las aplicaciones de una vacante" })
  @ApiResponse({ status: 200, description: 'Postulaciones listadas' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  findAll(@Query() query: FindAllApplicationsDto) {
    const { vacancyId, status, page = '1', limit = '10' } = query;
    return this.applicationService.findAll(vacancyId, status, Number(page), Number(limit));
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Retorna todas las aplicaciones por usuariop'})
  @ApiParam({ name: 'userId', description: 'Id del usuario'})
  @ApiResponse({ status: 200, description: "Postulaciones encontradas"})
  @ApiResponse({ status: 404, description: 'Postulaciones no encontradas'})
  async applicationsByRecruiter(@Param('userId') userId: string){
    return await this.applicationService.findAllApplicationsByRecruiter(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Retorna el detalle de una aplicación" })
  @ApiParam({ name: 'id', description: 'ID de la vacante' })
  @ApiResponse({ status: 200, description: 'Aplicación encontrada' })
  @ApiResponse({ status: 404, description: 'Aplicación no encontrada' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  findOne(@Param('id') id: string) {
    return this.applicationService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de una postulación' })
  @ApiParam({ name: 'id', description: 'ID de la postulación' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'user')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.applicationService.updateStatus(id, dto.status);
  }
}
