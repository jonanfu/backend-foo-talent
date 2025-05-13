import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateVacancyDto, VacancyStatus, Modalidad, Prioridad, Jornada } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class VacanciesService {
    private collection;

    constructor(private firebaseService: FirebaseService) {
        this.collection = this.firebaseService.getFirestore().collection('vacancies');
    }

    async create(dto: CreateVacancyDto, userId: string) {
        const fechaActual = dto.fecha || new Date().toISOString().split('T')[0];

        const vacancyData = {
            ...dto,
            userId,
            fecha: fechaActual,
            createdAt: FieldValue.serverTimestamp(),
        };

        const doc = await this.collection.add(vacancyData);
        return { id: doc.id };
    }

    async findAll(
        status?: VacancyStatus,
        search = '',
        page = 1,
        limit = 10,
        modalidad?: Modalidad,
        prioridad?: Prioridad,
        ubicacion?: string,
        jornada?: Jornada,
    ) {
        let query = this.collection as FirebaseFirestore.Query;

        if (status) {
            query = query.where('estado', '==', status);
        }

        if (modalidad) {
            query = query.where('modalidad', '==', modalidad);
        }

        if (prioridad) {
            query = query.where('prioridad', '==', prioridad);
        }

        if (ubicacion) {
            query = query.where('ubicacion', '==', ubicacion);
        }

        if (jornada) {
            query = query.where('jornada', '==', jornada);
        }

        if (search) {
            query = query
                .where('puesto', '>=', search)
                .where('puesto', '<=', search + '\uf8ff');
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

    async findAllVacanciesByRecruiter(userId: string) {
        const vacanciesSnapshot = await this.collection
            .where('userId', '==', userId)
            .get();

        if (vacanciesSnapshot.empty) {
            throw new NotFoundException('Vacantes no encontradas');
        }

        const vacancies = vacanciesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return vacancies;
    }

    async update(id: string, dto: UpdateVacancyDto, userId: string, isAdmin: boolean) {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new NotFoundException(`Vacante con ID ${id} no encontrada`);
        }

        const vacancy = doc.data();

        if (vacancy.userId !== userId && !isAdmin) {
            throw new ForbiddenException('No tienes permiso para actualizar esta vacante');
        }

        const updateData = {
            ...dto,
            updatedAt: FieldValue.serverTimestamp(),
        };

        await docRef.update(updateData);
        return { id, message: 'Vacante actualizada correctamente' };
    }

    async delete(id: string, userId: string, isAdmin: boolean) {
        const docRef = this.collection.doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new NotFoundException(`Vacante con ID ${id} no encontrada`);
        }

        const vacancy = doc.data();

        if (vacancy.userId !== userId && !isAdmin) {
            throw new ForbiddenException('No tienes permiso para eliminar esta vacante');
        }

        await docRef.delete();
        return { id, message: 'Vacante eliminada correctamente' };
    }
}