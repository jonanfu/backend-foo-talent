import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller'
import { FirebaseModule } from 'src/firebase/firebase.module';
import { AvatarService } from './services/avatar.service';

@Module({
  imports: [FirebaseModule],
  providers: [AuthService, AvatarService],
  exports: [AuthService, AvatarService],
  controllers: [AuthController]
})
export class AuthModule {}
