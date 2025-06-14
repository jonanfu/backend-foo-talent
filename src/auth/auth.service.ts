import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service'; // Ajusta la ruta según tu estructura
import { AvatarService } from './services/avatar.service';

@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService, private readonly avatarService: AvatarService) { }

  async createUser(
    email: string,
    password: string,
    displayName: string,
    phoneNumber: string,
    role: string,
    photoUrl?: string
  ) {
    const auth = this.firebaseService.getAuth();

    // Asignar avatar por defecto si no se proporciona
    let finalPhotoUrl = photoUrl;
    if (!finalPhotoUrl) {
      finalPhotoUrl = await this.avatarService.generateAvatarFromName(displayName);
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      phoneNumber,
      photoURL: finalPhotoUrl,
    });

    await auth.setCustomUserClaims(userRecord.uid, { role });

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      phoneNumber: userRecord.phoneNumber,
      photoUrl: userRecord.photoURL,
      role
    };
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

  async updatePassword(uid: string, newPassword: string) {
    try {
      await this.firebaseService.getAuth().updateUser(uid, {
        password: newPassword,
      });
      return { message: 'Contraseña actualizada', uid };
    } catch (error) {
      throw new Error(`Error al actualizar contraseña: ${error.message}`);
    }
  }
} 
