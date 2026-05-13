import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../../src/modules/product/product.controller';
import { ProductService } from '../../src/modules/product/product.service';
import { JwtPayload } from '../../src/shared/interfaces/jwt-payload.interface';

const mockUser: JwtPayload = {
  sub: 'user-uuid-1',
  email: 'owner@store.com',
  role: 'store_owner',
  tenantId: 'tenant-uuid-1',
};

const mockProduct = {
  id: 'product-uuid-1',
  name: 'Pão Francês',
  price: 0.75,
  unitType: 'unit',
  stock: 100,
  stockThreshold: 10,
  isActive: true,
  category: { id: 'category-uuid-1', name: 'Pães' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockListResponse = {
  data: [mockProduct],
  meta: { page: 1, total: 1, limit: 50 },
};

const mockProductService = {
  findAll: jest.fn().mockResolvedValue(mockListResponse),
  findOne: jest.fn().mockResolvedValue(mockProduct),
  create: jest.fn().mockResolvedValue(mockProduct),
  update: jest.fn().mockResolvedValue(mockProduct),
  remove: jest.fn().mockResolvedValue({ ...mockProduct, isActive: false }),
};

describe('ProductController', () => {
  let controller: ProductController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  describe('findAll', () => {
    it('should call productService.findAll with tenantId from JWT', async () => {
      const query = { page: 1, limit: 20 };
      const result = await controller.findAll(mockUser, query as never);

      expect(mockProductService.findAll).toHaveBeenCalledWith('tenant-uuid-1', query);
      expect(result).toEqual(mockListResponse);
    });

    it('should return the service list response', async () => {
      const result = await controller.findAll(mockUser, {} as never);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should call productService.findOne with id and tenantId from JWT', async () => {
      const result = await controller.findOne('product-uuid-1', mockUser);

      expect(mockProductService.findOne).toHaveBeenCalledWith('product-uuid-1', 'tenant-uuid-1');
      expect(result).toEqual(mockProduct);
    });
  });

  describe('create', () => {
    it('should call productService.create with tenantId from JWT and dto', async () => {
      const dto = { name: 'Croissant', price: 3.50, unitType: 'unit' as const };
      const result = await controller.create(mockUser, dto as never);

      expect(mockProductService.create).toHaveBeenCalledWith('tenant-uuid-1', dto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('should call productService.update with id, tenantId from JWT and dto', async () => {
      const dto = { name: 'Pão Francês Atualizado' };
      const result = await controller.update('product-uuid-1', mockUser, dto as never);

      expect(mockProductService.update).toHaveBeenCalledWith('product-uuid-1', 'tenant-uuid-1', dto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('remove', () => {
    it('should call productService.remove with id and tenantId from JWT', async () => {
      const result = await controller.remove('product-uuid-1', mockUser);

      expect(mockProductService.remove).toHaveBeenCalledWith('product-uuid-1', 'tenant-uuid-1');
      expect(result.isActive).toBe(false);
    });
  });
});
