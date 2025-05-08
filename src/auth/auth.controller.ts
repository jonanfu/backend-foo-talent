import {
  Body,
  Controller,
  Post,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  Get,
  Query,

} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario con avatar automático' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado con avatar generado',
    schema: {
      example: {
        uid: 'abc123xyz456',
        email: 'usuario@example.com',
        displayName: 'Juan Pérez',
        phoneNumber: '+5491123456789',
        photoUrl: 'https://ui-avatars.com/api/?name=J&background=FF5733&color=fff&size=256',
        role: 'user'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Error en los datos proporcionados' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.authService.createUser(
        createUserDto.email,
        createUserDto.password,
        createUserDto.displayName,
        createUserDto.phoneNumber,
        createUserDto.role,
        createUserDto.photoUrl
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('verify-token')
  @ApiOperation({ summary: 'Verificar idToken de Firebase' })
  @ApiBody({ schema: { example: { idToken: 'string' } } })
  async verifyToken(@Body() body: { idToken: string }) {
    try {
      const decoded = await this.authService.verifyToken(body.idToken);
      return { uid: decoded.uid, email: decoded.email, name: decoded.name, phoneNumber: decoded.phoneNumber, role: decoded.role };

    } catch (err) {
      throw new BadRequestException('Token inválido o expirado');
    }
  }

  @Get('check-email')
  @ApiOperation({ summary: "Verificar si existe un correo de usuario en Firebase" })
  async checkEmail(@Query('email') email: string) {
    return this.authService.isEmailRegistered(email);
  }

  @Post('reset-password-link')
  async getResetPasswordLink(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('El campo "email" es obligatorio');
    }

    try {
      const link = await this.authService.generatePasswordResetLink(email);
      return { resetLink: link };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

}