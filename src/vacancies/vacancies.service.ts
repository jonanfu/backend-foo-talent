import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { VacancyStatus } from './dto/create-vacancy.dto';
import { v4 as uuid } from 'uuid';
import { FieldValue } from 'firebase-admin/firestore';

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
        if (!image) return;
        if (image.size > 5_000_000) {
            throw new BadRequestException('La imagen no puede superar 5MB');
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
            createdAt: FieldValue.serverTimestamp(),
        });

        return { id: doc.id };
    }

    async findAll(status?: VacancyStatus, search = '', page = 1, limit = 10) {
        let query = this.collection as FirebaseFirestore.Query;

        // Filtros dinámicos
        if (status) {
            query = query.where('estado', '==', status);
        }

        if (search) {
            query = query.where('nombre', '>=', search)
                .where('nombre', '<=', search + '\uf8ff');
        }

        query = query.orderBy('createdAt', 'desc');

        const snapshot = await query.offset((page - 1) * limit).limit(limit).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }


    async findOne(id: string) {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) {
            throw new NotFoundException(`La vacante con ID ${id} no existe`);
        }
        return { id: doc.id, ...doc.data() };
    }

    async update(id: string, dto: UpdateVacancyDto, userId: string, isAdmin: boolean) {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new NotFoundException(`Vacante con ID ${id} no encontrada`);
        }

        const vacancy = doc.data();

        if (!isAdmin && vacancy.userId !== userId) {
            throw new ForbiddenException('No tienes permiso para actualizar esta vacante');
        }

        await docRef.update({
            ...dto,
            updatedAt: new Date()
        });

        return { id, message: 'Vacante actualizada correctamente' };
    }


    async delete(id: string, userId: string, isAdmin: boolean) {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new NotFoundException(`Vacante con ID ${id} no encontrada`);
        }

        const vacancy = doc.data();

        // Verificar si el usuario es dueño o admin
        if (!isAdmin && vacancy.userId !== userId) {
            throw new ForbiddenException('No tienes permiso para eliminar esta vacante');
        }

        await docRef.delete();
        return { id, message: 'Vacante eliminada correctamente' };
    }

}