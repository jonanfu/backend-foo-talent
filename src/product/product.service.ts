import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service'; // Ajusta el path según tu estructura
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ProductService {
  private collection;

  constructor(private firebaseService: FirebaseService) {
    this.collection = this.firebaseService.getFirestore().collection('products');
  }

  async create(dto: CreateProductDto, userId: string, file: Express.Multer.File) {
    const fileName = `uploads/${uuid()}.pdf`;
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
      userId,
      pdfUrl: url,
    });

    return { id: doc.id };
  }

  async findAll(search = '', page = 1, limit = 10) {
    let query = this.collection.orderBy('fecha', 'desc');

    if (search) {
      query = query.where('nombre', '>=', search).where('nombre', '<=', search + '\uf8ff');
    }

    const snapshot = await query.offset((page - 1) * limit).limit(limit).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) throw new NotFoundException('Producto no encontrado');
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, dto: UpdateProductDto, file?: Express.Multer.File) {
    const docRef = this.collection.doc(id);
    const docSnap = await docRef.get();
  
    if (!docSnap.exists) {
      throw new NotFoundException('Producto no encontrado');
    }
  
    const currentData = docSnap.data();
    let newPdfUrl = currentData.pdfUrl;
  
    // Si hay archivo nuevo, subimos y borramos el anterior
    if (file) {
      if (currentData.pdfUrl) {
        try {
          await this.firebaseService.getBucket().file(currentData.pdfUrl).delete();
          console.log('Archivo anterior eliminado');
        } catch (e) {
          console.error('Error al eliminar el PDF anterior:', e);
        }
      }
  
      const uniqueName = `${Date.now()}-${file.originalname}`;
      const bucketFile = this.firebaseService.getBucket().file(uniqueName);
  
      await bucketFile.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });
  
      newPdfUrl = bucketFile.publicUrl(); // o firma URL si usas acceso restringido
    }
  
    await docRef.update({ ...dto, pdfUrl: newPdfUrl });
  
    return { message: 'Producto actualizado correctamente' };
  }
  

  async remove(id: string) {
    const docSnap = await this.collection.doc(id).get(); 
  
    if (!docSnap.exists) {
      throw new NotFoundException('Producto no encontrado');
    }
  
    const data = docSnap.data();
    const pdfUrl = data?.pdfUrl;
  
    if (pdfUrl) {
      try {
        const file = this.firebaseService.getBucket().file(pdfUrl);
        await file.delete();
        console.log('Archivo eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar el archivo:', error);
      }
    } else {
      console.warn('No se encontró la URL del PDF, se omite la eliminación del archivo.');
    }
  
    await this.collection.doc(id).delete();
    return { message: 'Producto eliminado' };
  }
}
