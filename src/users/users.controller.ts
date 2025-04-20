// src/users/users.controller.ts
import {
    Controller,
    Get,
    Param,
    Patch,
    Body,
    UseGuards,
  } from '@nestjs/common';
  import { UsersService } from './users.service';
  import { Roles } from 'src/auth/decorators/roles.decorator';
  import { UpdateUserRoleDto } from './dto/update-role.dto';
  import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
  } from '@nestjs/swagger';
  import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
  import { RolesGuard } from 'src/auth/guards/roles.guard';
  
  @ApiTags('Users')
  @ApiBearerAuth('access-token')
  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Listar todos los usuarios (solo admin)' })
    @ApiResponse({ status: 200, description: 'Lista de usuarios' })
    @ApiResponse({ status: 403, description: 'No tienes permiso' })
    async findAll() {
      return this.usersService.listUsers();
    }
  
    @Get(':uid')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Obtener un usuario por UID (solo admin)' })
    @ApiResponse({ status: 200, description: 'Datos del usuario' })
    @ApiResponse({ status: 403, description: 'No tienes permiso' })
    async findOne(@Param('uid') uid: string) {
      return this.usersService.getUserById(uid);
    }
  
    @Patch(':uid/role')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Actualizar el rol de un usuario (solo admin)' })
    @ApiResponse({ status: 200, description: 'Rol actualizado' })
    @ApiResponse({ status: 403, description: 'No tienes permiso' })
    async updateRole(@Param('uid') uid: string, @Body() dto: UpdateUserRoleDto) {
      return this.usersService.updateUserRole(uid, dto);
    }
  }
  