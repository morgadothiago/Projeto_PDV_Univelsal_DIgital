import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from '../../src/modules/admin/admin.controller';
import { AdminService } from '../../src/modules/admin/admin.service';

const mockMetrics = {
  activeTenants: 12,
  todayOrders: 45,
  todayRevenue: '3200.50',
  totalTenants: 15,
};

const mockAdminService = {
  getGlobalMetrics: jest.fn().mockResolvedValue(mockMetrics),
};

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  describe('getMetrics', () => {
    it('should call adminService.getGlobalMetrics and return metrics', async () => {
      const result = await controller.getMetrics();

      expect(mockAdminService.getGlobalMetrics).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockMetrics);
    });

    it('should return all required metric fields', async () => {
      const result = await controller.getMetrics();

      expect(result.activeTenants).toBe(12);
      expect(result.todayOrders).toBe(45);
      expect(result.todayRevenue).toBe('3200.50');
      expect(result.totalTenants).toBe(15);
    });

    it('should propagate service errors to the caller', async () => {
      mockAdminService.getGlobalMetrics.mockRejectedValueOnce(new Error('Service error'));

      await expect(controller.getMetrics()).rejects.toThrow('Service error');
    });
  });
});
