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
    const fileName = `${uuid()}.pdf`;
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

  async update(id: string, dto: UpdateProductDto) {
    await this.collection.doc(id).update({ ...dto });
    return { message: 'Producto actualizada' };
  }

  async remove(id: string) {
    await this.collection.doc(id).delete();
    return { message: 'Producto eliminada' };
  }
}
