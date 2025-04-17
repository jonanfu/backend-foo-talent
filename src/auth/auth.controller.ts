import {
    Body,
    Controller,
    Post,
    BadRequestException,
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
  import * as admin from 'firebase-admin';
  import { CreateUserDto } from './dto/create-user.dto';
  
  @ApiTags('Auth')
  @Controller('auth')
  export class AuthController {
    @Post('register')
    @ApiOperation({ summary: 'Registrar un nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Error de validación o usuario existente' })
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async register(@Body() createUserDto: CreateUserDto) {
      const { email, password } = createUserDto;
  
      try {
        const user = await admin.auth().createUser({ email, password });
        return { uid: user.uid, email: user.email };
      } catch (err) {
        throw new BadRequestException(err.message);
      }
    }
  
    @Post('verify-token')
    @ApiOperation({ summary: 'Verificar idToken de Firebase' })
    @ApiBody({ schema: { example: { idToken: 'string' } } })
    async verifyToken(@Body() body: { idToken: string }) {
      try {
        const decoded = await admin.auth().verifyIdToken(body.idToken);
        return { uid: decoded.uid, email: decoded.email };
      } catch (err) {
        throw new BadRequestException('Token inválido o expirado');
      }
    }
  }
  