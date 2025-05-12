// src/token/token.controller.ts
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { TokenService } from './token.service';
import { PayloadlDto } from './dto/payload.dto';

@Controller('tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('generate')
  generate(@Body() payload: PayloadlDto) {
    return {
      token: this.tokenService.generateToken(payload),
    };
  }

  @Get('validate/:token')
  validate(@Param('token') token: string) {
    const result = this.tokenService.validateToken(token);
    return {
      valid: !!result,
      payload: result,
    };
  }

  @Get('decode/:token')
  decode(@Param('token') token: string) {
    return this.tokenService.decodeToken(token);
  }
}