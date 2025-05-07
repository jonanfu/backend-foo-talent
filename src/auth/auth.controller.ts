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
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error de validación o usuario existente' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() createUserDto: CreateUserDto) {
    const { email, password, displayName, phoneNumber, role } = createUserDto;

    try {
      const user = await this.authService.createUser(email, password, displayName,phoneNumber,role);
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber
      };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Post('verify-token')
  @ApiOperation({ summary: 'Verificar idToken de Firebase' })
  @ApiBody({ schema: { example: { idToken: 'string' } } })
  async verifyToken(@Body() body: { idToken: string }) {
    try {
      const decoded = await this.authService.verifyToken(body.idToken);
      return { uid: decoded.uid, email: decoded.email, name: decoded.name, phoneNumber: decoded.phoneNumber ,role: decoded.role };

    } catch (err) {
      throw new BadRequestException('Token inválido o expirado');
    }
  }
  
  @Get('check-email')
  @ApiOperation({ summary: "Verificar si existe un correo de usuario en Firebase"})
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

