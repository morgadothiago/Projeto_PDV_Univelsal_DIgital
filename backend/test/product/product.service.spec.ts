import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductService } from '../../src/modules/product/product.service';
import { ProductRepository } from '../../src/modules/product/product.repository';

const mockProduct = {
  id: 'product-uuid-1',
  tenantId: 'tenant-uuid-1',
  name: 'Pão Francês',
  price: '0.75',
  unitType: 'unit',
  categoryId: 'category-uuid-1',
  stock: '100',
  stockThreshold: '10',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockCategory = {
  id: 'category-uuid-1',
  tenantId: 'tenant-uuid-1',
  name: 'Pães',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProductWithCategory = {
  product: mockProduct,
  category: { id: mockCategory.id, name: mockCategory.name },
};

const mockProductRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByIdAndTenant: jest.fn(),
  findCategoryByIdAndTenant: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductRepository, useValue: mockProductRepository },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  describe('findAll', () => {
    it('should return paginated products list filtered by tenantId', async () => {
      mockProductRepository.findAll.mockResolvedValue({
        items: [mockProductWithCategory],
        total: 1,
      });

      const result = await service.findAll('tenant-uuid-1', { page: 1, limit: 50 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(50);
      expect(mockProductRepository.findAll).toHaveBeenCalledWith('tenant-uuid-1', expect.objectContaining({ page: 1, limit: 50 }));
    });

    it('should pass filters to repository', async () => {
      mockProductRepository.findAll.mockResolvedValue({ items: [], total: 0 });

      await service.findAll('tenant-uuid-1', { categoryId: 'category-uuid-1', search: 'pão', isActive: true });

      expect(mockProductRepository.findAll).toHaveBeenCalledWith(
        'tenant-uuid-1',
        expect.objectContaining({ categoryId: 'category-uuid-1', search: 'pão', isActive: true }),
      );
    });

    it('should return empty list when no products found', async () => {
      mockProductRepository.findAll.mockResolvedValue({ items: [], total: 0 });

      const result = await service.findAll('tenant-uuid-1', {});

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return product when found and belongs to tenant', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProductWithCategory);

      const result = await service.findOne('product-uuid-1', 'tenant-uuid-1');

      expect(result.id).toBe('product-uuid-1');
      expect(result.name).toBe('Pão Francês');
      expect(result.price).toBe(0.75);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(undefined);

      await expect(service.findOne('nonexistent', 'tenant-uuid-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when product belongs to different tenant', async () => {
      const productOtherTenant = {
        product: { ...mockProduct, tenantId: 'other-tenant' },
        category: null,
      };
      mockProductRepository.findById.mockResolvedValue(productOtherTenant);

      await expect(service.findOne('product-uuid-1', 'tenant-uuid-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      name: 'Croissant',
      price: 3.50,
      unitType: 'unit' as const,
      categoryId: 'category-uuid-1',
    };

    it('should create product with correct tenantId', async () => {
      mockProductRepository.findCategoryByIdAndTenant.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockResolvedValue(mockProduct);
      mockProductRepository.findById.mockResolvedValue(mockProductWithCategory);

      const result = await service.create('tenant-uuid-1', createDto);

      expect(mockProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: 'tenant-uuid-1', name: 'Croissant' }),
      );
      expect(result.name).toBe('Pão Francês');
    });

    it('should throw BadRequestException when categoryId does not belong to tenant', async () => {
      mockProductRepository.findCategoryByIdAndTenant.mockResolvedValue(undefined);

      await expect(service.create('tenant-uuid-1', createDto)).rejects.toThrow(BadRequestException);
    });

    it('should create product without category when categoryId not provided', async () => {
      const dtoWithoutCategory = { name: 'Item Avulso', price: 1.00, unitType: 'unit' as const };
      mockProductRepository.create.mockResolvedValue({ ...mockProduct, categoryId: null });
      mockProductRepository.findById.mockResolvedValue({ product: { ...mockProduct, categoryId: null }, category: null });

      const result = await service.create('tenant-uuid-1', dtoWithoutCategory);

      expect(mockProductRepository.findCategoryByIdAndTenant).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update product when found and belongs to tenant', async () => {
      mockProductRepository.findByIdAndTenant.mockResolvedValue(mockProduct);
      mockProductRepository.update.mockResolvedValue(undefined);
      mockProductRepository.findById.mockResolvedValue({
        product: { ...mockProduct, name: 'Croissant Atualizado' },
        category: null,
      });

      const result = await service.update('product-uuid-1', 'tenant-uuid-1', { name: 'Croissant Atualizado' });

      expect(mockProductRepository.update).toHaveBeenCalledWith('product-uuid-1', expect.objectContaining({ name: 'Croissant Atualizado' }));
      expect(result.name).toBe('Croissant Atualizado');
    });

    it('should throw NotFoundException when product not found for update', async () => {
      mockProductRepository.findByIdAndTenant.mockResolvedValue(undefined);

      await expect(service.update('nonexistent', 'tenant-uuid-1', { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when new categoryId does not belong to tenant', async () => {
      mockProductRepository.findByIdAndTenant.mockResolvedValue(mockProduct);
      mockProductRepository.findCategoryByIdAndTenant.mockResolvedValue(undefined);

      await expect(
        service.update('product-uuid-1', 'tenant-uuid-1', { categoryId: 'foreign-category' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete product when found and belongs to tenant', async () => {
      mockProductRepository.findByIdAndTenant.mockResolvedValue(mockProduct);
      mockProductRepository.softDelete.mockResolvedValue({ ...mockProduct, isActive: false });

      const result = await service.remove('product-uuid-1', 'tenant-uuid-1');

      expect(mockProductRepository.softDelete).toHaveBeenCalledWith('product-uuid-1');
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when product not found for removal', async () => {
      mockProductRepository.findByIdAndTenant.mockResolvedValue(undefined);

      await expect(service.remove('nonexistent', 'tenant-uuid-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when softDelete returns undefined', async () => {
      mockProductRepository.findByIdAndTenant.mockResolvedValue(mockProduct);
      mockProductRepository.softDelete.mockResolvedValue(undefined);

      await expect(service.remove('product-uuid-1', 'tenant-uuid-1')).rejects.toThrow(NotFoundException);
    });
  });
});
