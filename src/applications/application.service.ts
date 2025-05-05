import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service'; 
import { v4 as uuid } from 'uuid';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationStatus } from './enums/application-status.enum';

@Injectable()
export class ApplicationService {
  private collection;

  constructor(private firebaseService: FirebaseService) {
    this.collection = this.firebaseService.getFirestore().collection('applications');
  }

  async create(dto: CreateApplicationDto, file: Express.Multer.File) {
    const fileName = `cvs/${uuid()}.pdf`;
    const fileRef = this.firebaseService.getBucket().file(fileName);

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2030',
    });

    const doc = await this.collection.add({
      ...dto,
      status: dto.status ?? ApplicationStatus.RECEIVED,
      cvPath: url,
      createdAt: new Date().toISOString(),
    });

    return {
      id: doc.id 
    };
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
