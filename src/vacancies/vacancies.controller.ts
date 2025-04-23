import {
    Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors,
    UploadedFile, Query, Req, UseGuards
} from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiConsumes, ApiBearerAuth, ApiTags, ApiBody,
    ApiOperation, ApiResponse, ApiQuery
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

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Cambiar estado de una vacante' })
    @ApiResponse({
        status: 200,
        description: 'Estado actualizado',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Estado actualizado a activo'
                }
            }
        }
    })
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: VacancyStatus
    ): Promise<{ message: string }> {
        return this.vacanciesService.updateStatus(id, status);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Eliminar una vacante' })
    @ApiResponse({
        status: 200,
        description: 'Vacante eliminada',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Vacante eliminada exitosamente'
                }
            }
        }
    })
    @ApiResponse({ status: 403, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Vacante no encontrada' })
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        return this.vacanciesService.remove(id);
    }

    @Post(':id/image')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'user')
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Actualizar imagen de la vacante' })
    @ApiResponse({
        status: 200,
        description: 'Imagen actualizada',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Imagen actualizada con éxito'
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Imagen no proporcionada o inválida' })
    @ApiResponse({ status: 403, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Vacante no encontrada' })
    async updateImage(
        @Param('id') id: string,
        @UploadedFile() image: Express.Multer.File,
        @Req() req: any
    ): Promise<{ message: string }> {
        return this.vacanciesService.updateImage(id, req.user.uid, image);
    }
}