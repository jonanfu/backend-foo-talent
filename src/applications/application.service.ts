import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationStatus } from './enums/application-status.enum';
import { FieldValue } from 'firebase-admin/firestore';
import { VacanciesService } from 'src/vacancies/vacancies.service';
import { NotificationService } from 'src/notifications/notification.service';


@Injectable()
export class ApplicationService {
  private collection;

  constructor(
    private firebaseService: FirebaseService,
    private vacancyService: VacanciesService,
    private notificationService: NotificationService

  ) {
    this.collection = this.firebaseService.getFirestore().collection('applications');
  }

  async create(dto: CreateApplicationDto) {
    const doc = await this.collection.add({
      ...dto,
      status: dto.status ?? ApplicationStatus.RECEIVED,
      cvUrl: dto.cvUrl,
      createdAt: FieldValue.serverTimestamp(),
    }); 

    const vacancyData = await this.vacancyService.findOne(dto.vacancyId)

    this.notificationService.sendPostulationEmail(dto.email, vacancyData.puesto)

    return {
      id: doc.id
    };
  }

  async findAllApplications(status?: ApplicationStatus, page = 1, limit = 10) {
    let query = this.collection.orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findAll(vacancyId: string, status?: ApplicationStatus, page = 1, limit = 10) {
    let query = this.collection
      .where('vacancyId', '==', vacancyId)
      .orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findAllApplicationsByRecruiter(userId: string) {
    const vacancies = await this.vacancyService.findAllVacanciesByRecruiter(userId);

    const allApplications: any = [];

    for (const vacancy of vacancies) {
      const applicationsSnapshot = await this.collection
        .where('vacancyId', '==', vacancy.id)
        .get();

      if (!applicationsSnapshot.empty) {
        const applications = applicationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        allApplications.push(...applications);
      }
    }

    if (allApplications.length === 0) {
      throw new NotFoundException('No se encontraron aplicaciones para las vacantes de este reclutador');
    }

    return allApplications;
  }

  async findOne(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) throw new NotFoundException('Aplicación no encontrado');
    return { id: doc.id, ...doc.data() };
  }

  async updateStatus(id: string, status: ApplicationStatus) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Aplicación con ID ${id} no encontrada`);
    }

    await docRef.update({ status });

    return {
      message: 'Estado actualizado correctamente',
      id,
      status,
    };
  }

}
