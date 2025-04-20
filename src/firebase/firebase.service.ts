import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { Bucket } from '@google-cloud/storage';

@Injectable()
export class FirebaseService {
  private firestore: admin.firestore.Firestore;
  private auth: admin.auth.Auth;
  private bucket: Bucket;

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

      console.log('✅ Firebase Admin inicializado');
    }

    this.firestore = admin.firestore();
    this.auth = admin.auth();
    this.bucket = admin.storage().bucket();
  }

  getFirestore() {
    return this.firestore;
  }

  getAuth() {
    return this.auth;
  }

  getBucket() {
    return this.bucket;
  }
}
