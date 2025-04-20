import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service'; // Ajusta la ruta según tu estructura

@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async createUser(email: string, password: string, displayName: string) {
    const auth = this.firebaseService.getAuth();
  
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });
  
    // Asignar el rol de 'user' como custom claim
    await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });
  
    return userRecord;
  }
  

  async verifyToken(idToken: string) {
    const auth = this.firebaseService.getAuth();
    return await auth.verifyIdToken(idToken);
  }

  getStorage() {
    return this.firebaseService.getBucket();
  }
}
