import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateVacancyDto, VacancyStatus, Modalidad, Prioridad, Jornada } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class VacanciesService {
    private collection;
    private applicationsCollection;

constructor(private firebaseService: FirebaseService) {
    this.collection = this.firebaseService.getFirestore().collection('vacancies');
    this.applicationsCollection = this.firebaseService.getFirestore().collection('applications');
}

    async create(dto: CreateVacancyDto, userId: string) {
        // La fecha se asigna solo si no está definida en el DTO
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

        // Filtros dinámicos
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

    // 🔥 1️⃣ Buscar todas las aplicaciones relacionadas con esta vacante
    const applicationsSnapshot = await this.applicationsCollection
        .where('vacancyId', '==', id)
        .get();

    // 🔥 2️⃣ Eliminar cada una de las aplicaciones encontradas
    const batch = this.firebaseService.getFirestore().batch();
    applicationsSnapshot.forEach((app) => {
        batch.delete(app.ref);
    });

    await batch.commit();
    console.log(`🔥 Aplicaciones relacionadas con la vacante ${id} eliminadas correctamente.`);

    // 🔥 3️⃣ Eliminar la vacante
    await docRef.delete();
    console.log(`🔥 Vacante ${id} eliminada correctamente.`);

    return { id, message: 'Vacante y aplicaciones eliminadas correctamente' };
}


    
}