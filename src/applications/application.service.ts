import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationStatus } from './enums/application-status.enum';
import { FieldValue } from 'firebase-admin/firestore';
import { VacanciesService } from 'src/vacancies/vacancies.service';
import { NotificationService } from 'src/notifications/notification.service';
import { format } from 'date-fns';


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

  async findAllApplications(status?: ApplicationStatus, page = 1, limit = 1000) {
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

  async findAll(vacancyId: string, status?: ApplicationStatus, page = 1, limit = 100) {
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
        const applications = applicationsSnapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate?.(); // Convertir Timestamp a Date
          const formattedDate = createdAt
            ? format(createdAt, 'dd/MM/yyyy')
            : null;
        
          return {
            id: doc.id,
            job_posicion: vacancy.puesto,
            date: formattedDate,
            status: data.status,
            phone: data.phone,
            cvUrl: data.cvUrl,
          };
        });

        allApplications.push(...applications);
      }
    }

    return allApplications;
  }

  async findOne(id: string) {
    console.log('Buscando documento con ID:', id);
    const docRef = this.collection.doc(id);
    console.log('Ruta completa del documento:', docRef.path);
    
    const doc = await docRef.get();
    console.log('Documento existe?:', doc.exists);
    console.log('Datos del documento:', doc.data());
    
    if (!doc.exists) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }
    
    const data = doc.data();
    if (!data) {
      throw new NotFoundException(`Documento con ID ${id} no contiene datos`);
    }
    
    return { id: doc.id, ...data };
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
