import {
  Body,
  Controller,
  Post,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

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

  @Public()
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
  

}

