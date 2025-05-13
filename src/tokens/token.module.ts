// src/token/token.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'tuClaveSecreta', // Usa process.env.JWT_SECRET en producción
      signOptions: { expiresIn: '1d' }, // Ajusta el tiempo de expiración
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
  controllers: [TokenController]
})
export class TokenModule {}