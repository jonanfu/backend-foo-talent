import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'firebase', // Solo porque lo requiere passport-jwt, no se usa realmente
      ignoreExpiration: true,
    });
  }

  async validate(token: any) {
    return await this.authService.verifyToken(token);
  }
}