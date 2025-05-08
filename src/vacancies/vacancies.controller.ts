import {
    Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors,
    UploadedFile, Query, Req, UseGuards,
    Put
} from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto, Modalidad, Prioridad } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
//import { FileInterceptor } from '@nestjs/platform-express';
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
    @ApiConsumes('application/json')
    @ApiBody({
        description: 'Crear una nueva vacante (imagen opcional)',
        type: CreateVacancyDto,
        examples: {
            'application/json': {
                value: {
                    nombre: 'Desarrollador Backend',
                    descripcion: 'Vacante para desarrollador backend con experiencia en Node.js y NestJS.',
                    estado: VacancyStatus.ACTIVE,
                    image: 'https://example.com/imagen.jpg',
                    modalidad: 'remoto',
                    prioridad: 'alta',
                    ubicacion: 'Buenos Aires, Argentina'
                }
            }
        }
    })
    @ApiOperation({ summary: 'Crear una nueva vacante' })
    @ApiResponse({ status: 201, description: 'Vacante creada exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    async create(
        @Body() dto: CreateVacancyDto,
        @Req() req?: any
    ) {
        return this.vacanciesService.create(dto, req.user.uid);
    }


    @Get(':id')
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
    @ApiOperation({ summary: 'Listar todas las vacantes (publico)' })
    @ApiQuery({ name: 'status', required: false, enum: VacancyStatus, description: 'Filtrar por estado' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Tamaño de página' })
    @ApiQuery({ name: 'modalidad', required: false, enum: Modalidad, description: 'Filtrar por modalidad' })
    @ApiQuery({ name: 'prioridad', required: false, enum: Prioridad, description: 'Filtrar por prioridad' })
    @ApiQuery({ name: 'ubicacion', required: false, type: String, description: 'Filtrar por ubicación' })
    @ApiResponse({ status: 200, description: 'Vacantes listadas' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    async findAll(
        @Query('status') status?: VacancyStatus,
        @Query('search') search?: string,
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('modalidad') modalidad?: Modalidad,
        @Query('prioridad') prioridad?: Prioridad,
        @Query('ubicacion') ubicacion?: string
    ) {
        return this.vacanciesService.findAll(
            status,
            search,
            +page,
            +limit,
            modalidad,
            prioridad,
            ubicacion
        );
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