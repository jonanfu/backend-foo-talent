import {
    Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors,
    UploadedFile, Query, Req, UseGuards,
    Put
} from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiConsumes, ApiBearerAuth, ApiTags, ApiBody,
    ApiOperation, ApiResponse, ApiQuery,
    ApiParam
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { VacancyStatus } from './dto/create-vacancy.dto';

@ApiTags('Vacancies')
@ApiBearerAuth('access-token')
@Controller('vacancies')
export class VacanciesController {
    constructor(private readonly vacanciesService: VacanciesService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Crear una nueva vacante (imagen opcional)',
        schema: {
            type: 'object',
            properties: {
                nombre: {
                    type: 'string',
                    example: 'Desarrollador Backend',
                    description: 'Nombre de la vacante'
                },
                descripcion: {
                    type: 'string',
                    example: 'Buscamos experto en NestJS',
                    description: 'Descripción detallada del puesto'
                },
                fecha: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-12-31',
                    description: 'Fecha límite de aplicación'
                },
                estado: {
                    type: 'string',
                    enum: Object.values(VacancyStatus),
                    example: VacancyStatus.ACTIVE,
                    description: 'Estado actual de la vacante'
                },
                image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Imagen descriptiva (JPG/PNG)'
                }
            },
            required: ['nombre'] // Solo el nombre es obligatorio
        }
    })
    @ApiOperation({ summary: 'Crear una nueva vacante' })
    @ApiResponse({ status: 201, description: 'Vacante creada exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    async create(
        @Body() dto: CreateVacancyDto,
        @UploadedFile() image?: Express.Multer.File,
        @Req() req?: any
    ) {
        return this.vacanciesService.create(dto, req.user.uid, image);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Obtener una vacante por ID' })
    @ApiParam({ name: 'id', description: 'ID de la vacante' })
    @ApiResponse({ status: 200, description: 'Vacante encontrada' })
    @ApiResponse({ status: 404, description: 'Vacante no encontrada' })
    async findOne(@Param('id') id: string) {
        return this.vacanciesService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Actualizar vacante por ID (dueño o admin)' })
    @ApiParam({ name: 'id' })
    @ApiBody({
        description: 'Actualizar información de la vacante',
        type: UpdateVacancyDto
    })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateVacancyDto,
        @Req() req: any
    ) {
        const userId = req.user.uid;
        const isAdmin = req.user.role === 'admin';
        return this.vacanciesService.update(id, dto, userId, isAdmin);
    }


    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Listar todas las vacantes (admin y user)' })
    @ApiQuery({ name: 'status', required: false, enum: VacancyStatus, description: 'Filtrar por estado' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Tamaño de página' })
    @ApiResponse({ status: 200, description: 'Vacantes listadas' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    async findAll(
        @Query('status') status?: VacancyStatus,
        @Query('search') search?: string,
        @Query('page') page = 1,
        @Query('limit') limit = 10
    ) {
        return this.vacanciesService.findAll(status, search, +page, +limit);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Eliminar vacante por ID (dueño o admin)' })
    @ApiParam({ name: 'id' })
    async delete(
        @Param('id') id: string,
        @Req() req: any
    ) {
        const userId = req.user.uid;
        const isAdmin = req.user.role === 'admin';
        return this.vacanciesService.delete(id, userId, isAdmin);
    }

}