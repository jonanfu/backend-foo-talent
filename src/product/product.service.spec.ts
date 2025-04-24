import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { FirebaseService } from '../firebase/firebase.service';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(),
  add: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  orderBy: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
};

const mockBucket = {
  file: jest.fn().mockReturnThis(),
  save: jest.fn(),
  delete: jest.fn(),
  publicUrl: jest.fn().mockReturnValue('https://mock.url/pdf'),
  getSignedUrl: jest.fn().mockResolvedValue(['https://mock.url/pdf']),
};

const mockFirebaseService = {
  getFirestore: () => mockFirestore,
  getBucket: () => mockBucket,
};

describe('ProductService', () => {
  let service: ProductService;

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

    service = module.get<ProductService>(ProductService);
  });

  it('should create a product and upload a PDF', async () => {
    const dto: CreateProductDto = {
      nombre: 'Producto Test',
      descripcion: 'Desc',
      fecha: new Date().toISOString(),
    };
    const file = { buffer: Buffer.from('test'), mimetype: 'application/pdf' } as Express.Multer.File;

    const addMock = jest.fn().mockResolvedValue({ id: '123' });
    mockFirestore.collection = jest.fn().mockReturnValue({
      add: addMock,
    });

    const result = await service.create(dto, 'user123', file);
    expect(result).toEqual({ id: '123' });
    expect(mockBucket.file).toHaveBeenCalled();
    expect(addMock).toHaveBeenCalled();
  });

  it('should find all products', async () => {
    mockFirestore.offset = jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: [{ id: '1', data: () => ({ nombre: 'Test' }) }],
        }),
      }),
    });

    const result = await service.findAll('', 1, 10);
    expect(result).toEqual([{ id: '1', nombre: 'Test' }]);
  });

  it('should return one product by id', async () => {
    mockFirestore.get = jest.fn().mockResolvedValue({
      exists: true,
      id: '1',
      data: () => ({ nombre: 'Test' }),
    });

    const result = await service.findOne('1');
    expect(result).toEqual({ id: '1', nombre: 'Test' });
  });

  it('should throw NotFoundException if product does not exist', async () => {
    mockFirestore.get = jest.fn().mockResolvedValue({ exists: false });

    await expect(service.findOne('fake')).rejects.toThrow(NotFoundException);
  });

  it('should update a product and upload a new file', async () => {
    const dto: UpdateProductDto = {
      nombre: 'Actualizado',
      descripcion: 'Desc',
      fecha: new Date().toISOString(),
    };

    const file = { buffer: Buffer.from('new'), mimetype: 'application/pdf', originalname: 'test.pdf' } as Express.Multer.File;

    mockFirestore.doc = jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ pdfUrl: 'old/url.pdf' }),
      }),
      update: jest.fn().mockResolvedValue(null),
    });

    const result = await service.update('1', dto, file);
    expect(result).toEqual({ message: 'Producto actualizado correctamente' });
  });

  it('should delete product and PDF', async () => {
    mockFirestore.doc = jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ pdfUrl: 'old/url.pdf' }),
      }),
      delete: jest.fn(),
    });

    const result = await service.remove('1');
    expect(result).toEqual({ message: 'Producto eliminado' });
    expect(mockBucket.delete).toHaveBeenCalled();
  });
});
