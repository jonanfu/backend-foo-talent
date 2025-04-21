import {
  Body,
  Controller,
  Post,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error de validación o usuario existente' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() createUserDto: CreateUserDto) {
    const { email, password, displayName } = createUserDto;

    try {
      const user = await this.authService.createUser(email, password, displayName);
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Public()
  @Post('verify-token')
  @ApiOperation({ summary: 'Verificar idToken de Firebase' })
  @ApiBody({ schema: { example: { idToken: 'string' } } })
  async verifyToken(@Body() body: { idToken: string }) {
    try {
      const decoded = await this.authService.verifyToken(body.idToken);
      return { uid: decoded.uid, email: decoded.email, name: decoded.name, role: decoded.role };
    } catch (err) {
      throw new BadRequestException('Token inválido o expirado');
    }
  }

  @Get('prueba')
  Hola() {
    return this.authService.getStorage();
  }

}

