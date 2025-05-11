import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { File } from '@google-cloud/storage';

@Injectable()
export class StorageService {
    constructor(private readonly firebaseService: FirebaseService) { }

    async getSignedUrlFromUrl(url: string, expiresInMinutes = 120): Promise<string> {
        try {
            let filePath: string;

            // Manejar URLs en formato gs://
            if (url.startsWith('gs://')) {
                const gsUrl = new URL(url);
                filePath = gsUrl.pathname.substring(1); // Elimina el primer '/' del path
            }
            // Manejar URLs HTTPS
            else if (url.startsWith('https://firebasestorage.googleapis.com')) {
                const urlObj = new URL(url);
                filePath = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
            } else {
                throw new BadRequestException('Formato de URL no válido');
            }

            const bucket = this.firebaseService.getBucket();
            const file: File = bucket.file(filePath);

            // Verificar si el archivo existe
            const [exists] = await file.exists();
            if (!exists) {
                throw new NotFoundException('El archivo no existe en Firebase Storage');
            }

            // Generar URL firmada (válida por 2 horas por defecto)
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + expiresInMinutes * 60 * 1000,
            });

            return signedUrl;
        } catch (error) {
            throw new BadRequestException(`Error al generar la URL firmada: ${error.message}`);
        }
    }
}