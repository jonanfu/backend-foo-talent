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

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
export class VacanciesAdminController {
    constructor(private readonly vacanciesService: VacanciesService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Obtener todas las vacantes con nombre de recrutador' })
    @ApiResponse({ status: 200, description: 'Vacantes listadas (admin)' })
    async findAllAdmin(): Promise<any> {
        return await this.vacanciesService.findAllVacanciesByAdmin();
    }

}