import {
    Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards,
} from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto, VacancyStatus, Modalidad, Prioridad, Jornada } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import {
    ApiConsumes, ApiBearerAuth, ApiTags, ApiBody,
    ApiOperation, ApiResponse, ApiQuery, ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Vacancies')
@ApiBearerAuth('access-token')
@Controller('vacancies')
export class VacanciesController {
    constructor(private readonly vacanciesService: VacanciesService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('user')
    @ApiConsumes('application/json')
    @ApiBody({
        description: 'Crear una nueva vacante',
        type: CreateVacancyDto,
        examples: {
            'application/json': {
                value: {
                    puesto: 'Desarrollador Backend',
                    ubicacion: 'Buenos Aires, Argentina',
                    modalidad: Modalidad.REMOTO,
                    prioridad: Prioridad.ALTA,
                    estado: VacancyStatus.OPEN,
                    descripcion: 'Vacante para desarrollador backend con experiencia en Node.js y NestJS.',
                    jornada: Jornada.COMPLETA,
                    experiencia: '3-5 años en desarrollo backend',
                    responsabilidades: 'Desarrollar APIs, mantener código limpio, colaborar con el equipo frontend.',
                    fecha: '2025-05-10',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Crear una nueva vacante' })
    @ApiResponse({ status: 201, description: 'Vacante creada exitosamente', type: Object, example: { id: 'abc123' } })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    async create(@Body() dto: CreateVacancyDto, @Req() req: any) {
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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({ summary: 'Actualizar vacante por ID (dueño o admin)' })
    @ApiParam({ name: 'id', description: 'ID de la vacante' })
    @ApiBody({
        description: 'Actualizar información de la vacante',
        type: UpdateVacancyDto,
        examples: {
            'application/json': {
                value: {
                    puesto: 'Desarrollador Backend Senior',
                    descripcion: 'Vacante actualizada para desarrollador backend senior.',
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Vacante actualizada', type: Object, example: { id: 'abc123', message: 'Vacante actualizada correctamente' } })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 403, description: 'Prohibido (no eres dueño ni admin)' })
    @ApiResponse({ status: 404, description: 'Vacante no encontrada' })
    async update(@Param('id') id: string, @Body() dto: UpdateVacancyDto, @Req() req: any) {
        const userId = req.user.uid;
        const isAdmin = req.user.role === 'admin';
        return this.vacanciesService.update(id, dto, userId, isAdmin);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas las vacantes (público)' })
    @ApiQuery({ name: 'status', required: false, enum: VacancyStatus, description: 'Filtrar por estado' })
    @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por puesto' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (mínimo 1)', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Tamaño de página (mínimo 1)', example: 10 })
    @ApiQuery({ name: 'modalidad', required: false, enum: Modalidad, description: 'Filtrar por modalidad' })
    @ApiQuery({ name: 'prioridad', required: false, enum: Prioridad, description: 'Filtrar por prioridad' })
    @ApiQuery({ name: 'ubicacion', required: false, type: String, description: 'Filtrar por ubicación' })
    @ApiQuery({ name: 'jornada', required: false, enum: Jornada, description: 'Filtrar por jornada' })
    @ApiResponse({ status: 200, description: 'Vacantes listadas' })
    async findAll(
        @Query('status') status?: VacancyStatus,
        @Query('search') search?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '10',
        @Query('modalidad') modalidad?: Modalidad,
        @Query('prioridad') prioridad?: Prioridad,
        @Query('ubicacion') ubicacion?: string,
        @Query('jornada') jornada?: Jornada,
    ) {
        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.max(1, parseInt(limit, 10));
        return this.vacanciesService.findAll(status, search, pageNum, limitNum, modalidad, prioridad, ubicacion, jornada);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({ summary: 'Eliminar vacante por ID (dueño o admin)' })
    @ApiParam({ name: 'id', description: 'ID de la vacante' })
    @ApiResponse({ status: 200, description: 'Vacante eliminada', type: Object, example: { id: 'abc123', message: 'Vacante eliminada correctamente' } })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 403, description: 'Prohibido (no eres dueño ni admin)' })
    @ApiResponse({ status: 404, description: 'Vacante no encontrada' })
    async delete(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.uid;
        const isAdmin = req.user.role === 'admin';
        return this.vacanciesService.delete(id, userId, isAdmin);
    }

    //Obtener vacantes del reclutador (pasando el id del reclutador)
    @Get('/reclutador/:userId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @ApiOperation({ summary: 'Obtener todas las vacantes de un reclutador por UID' })
    @ApiParam({ name: 'userId', description: 'UID del reclutador' })
    @ApiResponse({ status: 200, description: 'Vacantes del reclutador listadas' })
    async findAllByRecruiter(@Param('userId') userId: string): Promise<any> {
        return await this.vacanciesService.findAllVacanciesByRecruiter(userId);
    }


    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Obtener todas las vacantes con nombre de recrutador' })
    @ApiResponse({ status: 200, description: 'Vacantes listadas (admin)' })
    async findAllAdmin(): Promise<any> {
        return await this.vacanciesService.findAllVacanciesByAdmin();
    }
}

