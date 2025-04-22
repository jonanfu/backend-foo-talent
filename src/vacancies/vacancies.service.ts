import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { VacancyStatus } from './dto/create-vacancy.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class VacanciesService {
    private collection;

    constructor(private firebaseService: FirebaseService) {
        this.collection = this.firebaseService.getFirestore().collection('vacancies');
    }

    async create(dto: CreateVacancyDto, userId: string, image?: Express.Multer.File) {
        // Validar tipo de imagen si existe
        if (image && !image.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            throw new BadRequestException('Solo se permiten imágenes JPG/JPEG/PNG');
        }

        let imageUrl = '';
        if (image) {
            const fileName = `vacancies/${uuid()}.${image.mimetype.split('/')[1]}`;
            const fileRef = this.firebaseService.getBucket().file(fileName);

            await fileRef.save(image.buffer, {
                metadata: {
                    contentType: image.mimetype,
                },
            });

            [imageUrl] = await fileRef.getSignedUrl({
                action: 'read',
                expires: '03-09-2030',
            });
        }

        const doc = await this.collection.add({
            ...dto,
            userId,
            imageUrl,
            estado: dto.estado || VacancyStatus.ACTIVE,
            createdAt: new Date(),
        });

        return { id: doc.id };
    }

    async findAll(status?: VacancyStatus, search = '', page = 1, limit = 10) {
        let query = this.collection.orderBy('createdAt', 'desc');

        if (status) {
            query = query.where('estado', '==', status);
        }

        if (search) {
            query = query.where('nombre', '>=', search)
                .where('nombre', '<=', search + '\uf8ff');
        }

        const snapshot = await query.offset((page - 1) * limit).limit(limit).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async findOne(id: string) {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) throw new NotFoundException('Vacante no encontrada');
        return { id: doc.id, ...doc.data() };
    }

    async update(id: string, dto: UpdateVacancyDto) {
        await this.collection.doc(id).update({
            ...dto,
            updatedAt: new Date()
        });
        return { message: 'Vacante actualizada' };
    }

    async updateStatus(id: string, status: VacancyStatus) {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) throw new NotFoundException('Vacante no encontrada');

        await this.collection.doc(id).update({
            estado: status,
            updatedAt: new Date()
        });

        return { message: `Estado actualizado a ${status}` };
    }

    async updateImage(id: string, userId: string, image: Express.Multer.File) {
        if (!image?.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            throw new BadRequestException('Solo se permiten imágenes JPG/JPEG/PNG');
        }

        const doc = await this.collection.doc(id).get();
        if (!doc.exists) throw new NotFoundException('Vacante no encontrada');

        // Verificar permisos (solo admin o el creador puede cambiar imagen)
        const vacancy = doc.data();
        if (vacancy.userId !== userId) {
            throw new ForbiddenException('No tienes permiso para actualizar esta vacante');
        }

        const fileName = `vacancies/${uuid()}.${image.mimetype.split('/')[1]}`;
        const fileRef = this.firebaseService.getBucket().file(fileName);

        await fileRef.save(image.buffer, {
            metadata: {
                contentType: image.mimetype,
            },
        });

        const [imageUrl] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-09-2030',
        });

        await this.collection.doc(id).update({
            imageUrl,
            updatedAt: new Date()
        });

        return { message: 'Imagen actualizada' };
    }

    async remove(id: string) {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) throw new NotFoundException('Vacante no encontrada');

        await this.collection.doc(id).delete();
        return { message: 'Vacante eliminada' };
    }
}