import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service'; // Ajusta la ruta según tu estructura

@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async createUser(email: string, password: string, displayName: string, phoneNumber : string, role: string) {
    const auth = this.firebaseService.getAuth();
  
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      phoneNumber,
    });
  
    await auth.setCustomUserClaims(userRecord.uid, { role: role });
  
    return userRecord;
  }
  

  async verifyToken(idToken: string) {
    const auth = this.firebaseService.getAuth();
    return await auth.verifyIdToken(idToken);
  }

  getStorage() {
    return this.firebaseService.getBucket();
  }

  async isEmailRegistered(email: string): Promise<boolean> {
    try {
      await this.firebaseService.getAuth().getUserByEmail(email);
      return true;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return false; 
      }
      throw error; 
    }
  }

  async generatePasswordResetLink(email: string): Promise<string> {
    try {
      const link = await this.firebaseService.getAuth().generatePasswordResetLink(email);
      return link;
    } catch (error) {
      throw new Error(`No se pudo generar el enlace: ${error.message}`);
    }
  }
} 
