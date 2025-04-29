import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { FirebaseService } from '../firebase/firebase.service';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// 👇 MOCKS completos de Firestore y Storage
const mockCollection = {
  add: jest.fn(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  orderBy: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
};

const mockFirestore = {
  collection: jest.fn(() => mockCollection),
};

const mockBucket = {
  file: jest.fn().mockReturnThis(),
  save: jest.fn(),
  delete: jest.fn(),
  publicUrl: jest.fn().mockReturnValue('https://mock.url/pdf'),
  getSignedUrl: jest.fn().mockResolvedValue(['https://mock.url/pdf']),
};

const mockFirebaseService = {
  getFirestore: jest.fn(() => mockFirestore),
  getBucket: jest.fn(() => mockBucket),
};

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product and upload a PDF', async () => {
      const dto: CreateProductDto = {
        nombre: 'Producto Test',
        descripcion: 'Desc',
        fecha: new Date().toISOString(),
      };
      const file = { buffer: Buffer.from('test'), mimetype: 'application/pdf' } as Express.Multer.File;

      mockCollection.add.mockResolvedValue({ id: '123' });

      const result = await productService.create(dto, 'user123', file);

      expect(result).toEqual({ id: '123' });
      expect(mockBucket.file).toHaveBeenCalled();
      expect(mockCollection.add).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should find all products', async () => {
      mockCollection.offset.mockReturnValue({
        limit: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            docs: [{ id: '1', data: () => ({ nombre: 'Producto Test' }) }],
          }),
        }),
      } as any);

      const result = await productService.findAll('', 1, 10);

      expect(result).toEqual([{ id: '1', nombre: 'Producto Test' }]);
    });
  });

  describe('findOne', () => {
    it('should return one product by id', async () => {
      mockCollection.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          id: '1',
          data: () => ({ nombre: 'Producto Test' }),
        }),
      } as any);

      const result = await productService.findOne('1');

      expect(result).toEqual({ id: '1', nombre: 'Producto Test' });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockCollection.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
      } as any);

      await expect(productService.findOne('fake')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product and upload a new file', async () => {
      const dto: UpdateProductDto = {
        nombre: 'Actualizado',
        descripcion: 'Desc actualizado',
        fecha: new Date().toISOString(),
      };
      const file = { buffer: Buffer.from('new'), mimetype: 'application/pdf', originalname: 'test.pdf' } as Express.Multer.File;

      mockCollection.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ pdfUrl: 'old/url.pdf' }),
        }),
        update: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await productService.update('1', dto, file);

      expect(result).toEqual({ message: 'Producto actualizado correctamente' });
    });
  });

  describe('remove', () => {
    it('should delete product and PDF', async () => {
      mockCollection.doc.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ pdfUrl: 'old/url.pdf' }),
        }),
        delete: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await productService.remove('1');

      expect(result).toEqual({ message: 'Producto eliminado' });
      expect(mockBucket.delete).toHaveBeenCalled();
    });
  });
});
