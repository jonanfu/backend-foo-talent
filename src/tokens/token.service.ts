// src/token/token.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Genera un token con el payload que le pases
   * @param payload Datos a incluir en el token
   * @param expiresIn Tiempo de expiración (opcional)
   * @returns Token JWT
   */
  generateToken(payload: any, expiresIn?: string): string {
    const options = expiresIn ? { expiresIn } : undefined;
    return this.jwtService.sign(payload, options);
  }

  /**
   * Valida un token
   * @param token Token a validar
   * @returns Payload decodificado o null si es inválido
   */
  validateToken(token: string): any | null {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
  }

  /**
   * Decodifica un token sin validar la firma (útil para ver datos expirados)
   * @param token Token a decodificar
   * @returns Payload decodificado
   */
  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}