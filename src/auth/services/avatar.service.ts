import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class AvatarService {
    private readonly defaultAvatarPath = 'default-avatars/default-avatar.png';
    private readonly bucketName = 'reclutamiento-12537.appspot.com';

    constructor(private firebaseService: FirebaseService) { }

    async getDefaultAvatarUrl(): Promise<string> {
        try {
            const bucket = this.firebaseService.getBucket();
            const fileRef = bucket.file(this.defaultAvatarPath);

            const [url] = await fileRef.getSignedUrl({
                action: 'read',
                expires: '03-09-2030',
            });

            return url;
        } catch (error) {
            console.error('Error al obtener avatar predeterminado:', error);
            // Fallback a URL pública directa
            return `https://storage.googleapis.com/reclutamiento-12537.appspot.com/${this.defaultAvatarPath}`;
        }
    }

    async generateAvatarFromName(name: string): Promise<string> {
        const initial = name.charAt(0).toUpperCase();

        const professionalColors = [
            '2C3E50',
            '3498DB',
            '1ABC9C',
            '27AE60',
            '16A085',
            '2980B9',
            '34495E',
            '7F8C8D',
            '95A5A6',
            'BDC3C7'
        ];

        const colorIndex = initial.charCodeAt(0) % professionalColors.length;
        const color = professionalColors[colorIndex];

        return `https://ui-avatars.com/api/?name=${initial}&background=${color}&color=fff&size=256&bold=true&font-size=0.65`;
    }
}