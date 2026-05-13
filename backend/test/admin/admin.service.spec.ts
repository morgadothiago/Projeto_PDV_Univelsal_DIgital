import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from '../../src/modules/admin/admin.service';
import { AdminRepository } from '../../src/modules/admin/admin.repository';

const mockMetrics = {
  activeTenants: 12,
  todayOrders: 45,
  todayRevenue: '3200.50',
  totalTenants: 15,
};

const mockAdminRepository = {
  getGlobalMetrics: jest.fn().mockResolvedValue(mockMetrics),
};

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: AdminRepository, useValue: mockAdminRepository },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getGlobalMetrics', () => {
    it('should return global platform metrics', async () => {
      const result = await service.getGlobalMetrics();

      expect(result.activeTenants).toBe(12);
      expect(result.todayOrders).toBe(45);
      expect(result.todayRevenue).toBe('3200.50');
      expect(result.totalTenants).toBe(15);
    });

    it('should delegate to adminRepository.getGlobalMetrics', async () => {
      await service.getGlobalMetrics();

      expect(mockAdminRepository.getGlobalMetrics).toHaveBeenCalledTimes(1);
    });

    it('should return metrics with all required fields', async () => {
      const result = await service.getGlobalMetrics();

      expect(result).toHaveProperty('activeTenants');
      expect(result).toHaveProperty('todayOrders');
      expect(result).toHaveProperty('todayRevenue');
      expect(result).toHaveProperty('totalTenants');
    });

    it('should propagate repository errors', async () => {
      mockAdminRepository.getGlobalMetrics.mockRejectedValueOnce(new Error('DB connection failed'));

      await expect(service.getGlobalMetrics()).rejects.toThrow('DB connection failed');
    });
  });
});
