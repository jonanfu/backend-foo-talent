import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {
    const raw = this.configService.get<string>('FIREBASE_CONFIG');

    if (!raw) throw new Error('FIREBASE_CONFIG no definida');

    const firebaseConfig = JSON.parse(raw);
    firebaseConfig.private_key = firebaseConfig.private_key.replace(/\\n/g, '\n');

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
        storageBucket: this.configService.get<string>('FIREBASE_STORAGE_BUCKET'),
      });
      console.log('✅ Firebase Admin inicializado con @nestjs/config');
    }
  }

  async verifyToken(idToken: string) {
    return await admin.auth().verifyIdToken(idToken);
  }

  getStorage() {
    return admin.storage().bucket();
  }
}
