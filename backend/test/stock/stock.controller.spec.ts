import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from '../../src/modules/stock/stock.controller';
import { StockService } from '../../src/modules/stock/stock.service';
import { JwtPayload } from '../../src/shared/interfaces/jwt-payload.interface';

const mockUser: JwtPayload = {
  sub: 'user-uuid-1',
  email: 'owner@store.com',
  role: 'store_owner',
  tenantId: 'tenant-uuid-1',
};

const mockStockEntry = {
  id: 'entry-uuid-1',
  tenantId: 'tenant-uuid-1',
  productId: 'product-uuid-1',
  quantity: '20',
  reason: 'Reposição',
  createdBy: 'user-uuid-1',
  createdAt: new Date(),
};

const mockListResponse = {
  data: [mockStockEntry],
  meta: { page: 1, total: 1, limit: 20 },
};

const mockLowStockProduct = {
  id: 'product-uuid-1',
  tenantId: 'tenant-uuid-1',
  name: 'Pão Francês',
  stock: '3',
  stockThreshold: '10',
};

const mockStockService = {
  createEntry: jest.fn().mockResolvedValue(mockStockEntry),
  findEntries: jest.fn().mockResolvedValue(mockListResponse),
  findAlerts: jest.fn().mockResolvedValue([mockLowStockProduct]),
};

describe('StockController', () => {
  let controller: StockController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        { provide: StockService, useValue: mockStockService },
      ],
    }).compile();

    controller = module.get<StockController>(StockController);
  });

  describe('createEntry', () => {
    it('should call stockService.createEntry with tenantId and userId from JWT', async () => {
      const dto = { productId: 'product-uuid-1', quantity: 20, reason: 'Reposição' };
      const result = await controller.createEntry(mockUser, dto);

      expect(mockStockService.createEntry).toHaveBeenCalledWith('tenant-uuid-1', 'user-uuid-1', dto);
      expect(result).toEqual(mockStockEntry);
    });
  });

  describe('findEntries', () => {
    it('should call stockService.findEntries with tenantId from JWT', async () => {
      const query = { page: 1, limit: 20 };
      const result = await controller.findEntries(mockUser, query as never);

      expect(mockStockService.findEntries).toHaveBeenCalledWith('tenant-uuid-1', query);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findAlerts', () => {
    it('should call stockService.findAlerts with tenantId from JWT', async () => {
      const result = await controller.findAlerts(mockUser);

      expect(mockStockService.findAlerts).toHaveBeenCalledWith('tenant-uuid-1');
      expect(result).toHaveLength(1);
      expect(result[0].stock).toBe('3');
    });
  });
});
