import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller'
import { FirebaseAuthStrategy } from './firebase.strategy';

@Module({
  providers: [AuthService, FirebaseAuthStrategy],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
