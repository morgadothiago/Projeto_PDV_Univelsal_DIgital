import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StockService } from '../../src/modules/stock/stock.service';
import { StockRepository } from '../../src/modules/stock/stock.repository';

const mockProduct = {
  id: 'product-uuid-1',
  tenantId: 'tenant-uuid-1',
  name: 'Pão Francês',
  price: '0.75',
  unitType: 'unit',
  categoryId: null,
  stock: '50',
  stockThreshold: '10',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStockEntry = {
  id: 'entry-uuid-1',
  tenantId: 'tenant-uuid-1',
  productId: 'product-uuid-1',
  quantity: '20',
  reason: 'Reposição semanal',
  createdBy: 'user-uuid-1',
  createdAt: new Date(),
};

const mockStockRepository = {
  findProductByIdAndTenant: jest.fn(),
  createEntryAndUpdateStock: jest.fn(),
  findEntriesByTenant: jest.fn(),
  findLowStockProducts: jest.fn(),
};

describe('StockService', () => {
  let service: StockService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        { provide: StockRepository, useValue: mockStockRepository },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
  });

  describe('createEntry', () => {
    const createDto = {
      productId: 'product-uuid-1',
      quantity: 20,
      reason: 'Reposição semanal',
    };

    it('should create stock entry and update product stock', async () => {
      mockStockRepository.findProductByIdAndTenant.mockResolvedValue(mockProduct);
      mockStockRepository.createEntryAndUpdateStock.mockResolvedValue(mockStockEntry);

      const result = await service.createEntry('tenant-uuid-1', 'user-uuid-1', createDto);

      expect(mockStockRepository.findProductByIdAndTenant).toHaveBeenCalledWith('product-uuid-1', 'tenant-uuid-1');
      expect(mockStockRepository.createEntryAndUpdateStock).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-uuid-1',
          productId: 'product-uuid-1',
          quantity: '20',
          reason: 'Reposição semanal',
          createdBy: 'user-uuid-1',
        }),
        70,
      );
      expect(result).toEqual(mockStockEntry);
    });

    it('should calculate new stock correctly (current + quantity)', async () => {
      const productWithStock50 = { ...mockProduct, stock: '50' };
      mockStockRepository.findProductByIdAndTenant.mockResolvedValue(productWithStock50);
      mockStockRepository.createEntryAndUpdateStock.mockResolvedValue(mockStockEntry);

      await service.createEntry('tenant-uuid-1', 'user-uuid-1', { productId: 'product-uuid-1', quantity: 30 });

      expect(mockStockRepository.createEntryAndUpdateStock).toHaveBeenCalledWith(
        expect.any(Object),
        80,
      );
    });

    it('should throw NotFoundException when product not found or does not belong to tenant', async () => {
      mockStockRepository.findProductByIdAndTenant.mockResolvedValue(undefined);

      await expect(
        service.createEntry('tenant-uuid-1', 'user-uuid-1', createDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should set reason to null when not provided', async () => {
      mockStockRepository.findProductByIdAndTenant.mockResolvedValue(mockProduct);
      mockStockRepository.createEntryAndUpdateStock.mockResolvedValue(mockStockEntry);

      await service.createEntry('tenant-uuid-1', 'user-uuid-1', { productId: 'product-uuid-1', quantity: 10 });

      expect(mockStockRepository.createEntryAndUpdateStock).toHaveBeenCalledWith(
        expect.objectContaining({ reason: null }),
        expect.any(Number),
      );
    });
  });

  describe('findEntries', () => {
    it('should return paginated stock entries filtered by tenantId', async () => {
      mockStockRepository.findEntriesByTenant.mockResolvedValue({
        items: [mockStockEntry],
        total: 1,
      });

      const result = await service.findEntries('tenant-uuid-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(mockStockRepository.findEntriesByTenant).toHaveBeenCalledWith('tenant-uuid-1', undefined, 1, 20);
    });

    it('should pass productId filter to repository when provided', async () => {
      mockStockRepository.findEntriesByTenant.mockResolvedValue({ items: [], total: 0 });

      await service.findEntries('tenant-uuid-1', { productId: 'product-uuid-1' });

      expect(mockStockRepository.findEntriesByTenant).toHaveBeenCalledWith('tenant-uuid-1', 'product-uuid-1', 1, 20);
    });
  });

  describe('findAlerts', () => {
    it('should return products below stock threshold for tenant', async () => {
      const lowStockProduct = { ...mockProduct, stock: '3', stockThreshold: '10' };
      mockStockRepository.findLowStockProducts.mockResolvedValue([lowStockProduct]);

      const result = await service.findAlerts('tenant-uuid-1');

      expect(result).toHaveLength(1);
      expect(mockStockRepository.findLowStockProducts).toHaveBeenCalledWith('tenant-uuid-1');
    });

    it('should return empty array when no products are below threshold', async () => {
      mockStockRepository.findLowStockProducts.mockResolvedValue([]);

      const result = await service.findAlerts('tenant-uuid-1');

      expect(result).toHaveLength(0);
    });
  });
});
