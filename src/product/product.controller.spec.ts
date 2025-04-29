import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

// Mock de ProductService
const mockProductService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock de los guards (para permitir siempre en tests)
const mockGuard = { canActivate: jest.fn(() => true) };

describe('ProductController', () => {
  let controller: ProductController;
  let service: jest.Mocked<typeof mockProductService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get(ProductService) as jest.Mocked<typeof mockProductService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto = {
        nombre: 'Producto Test',
        descripcion: 'Descripción',
        fecha: new Date().toISOString(),
      };
      const file = {} as Express.Multer.File;
      const req = { user: { uid: 'user123' } };

      service.create.mockResolvedValue({ id: 'prod123' });

      const result = await controller.create(dto, file, req);

      expect(service.create).toHaveBeenCalledWith(dto, 'user123', file);
      expect(result).toEqual({ id: 'prod123' });
    });
  });

  describe('findAll', () => {
    it('should return a list of products', async () => {
      const products = [{ id: '1', nombre: 'Test' }];
      service.findAll.mockResolvedValue(products);

      const result = await controller.findAll('', 1, 10);

      expect(service.findAll).toHaveBeenCalledWith('', 1, 10);
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const product = { id: '1', nombre: 'Producto Test' };
      service.findOne.mockResolvedValue(product);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(product);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const dto = {
        nombre: 'Producto Actualizado',
        descripcion: 'Nueva descripción',
        fecha: new Date().toISOString(),
      };
      const file = {} as Express.Multer.File;

      service.update.mockResolvedValue({ message: 'Producto actualizado correctamente' });

      const result = await controller.update('1', dto, file);

      expect(service.update).toHaveBeenCalledWith('1', dto, file);
      expect(result).toEqual({ message: 'Producto actualizado correctamente' });
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      service.remove.mockResolvedValue({ message: 'Producto eliminado' });

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual({ message: 'Producto eliminado' });
    });
  });
});
