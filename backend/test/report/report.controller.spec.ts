import { Test, TestingModule } from '@nestjs/testing';
import { ReportController } from '../../src/modules/report/report.controller';
import { ReportService } from '../../src/modules/report/report.service';
import { JwtPayload } from '../../src/shared/interfaces/jwt-payload.interface';

const mockOwnerUser: JwtPayload = {
  sub: 'owner-uuid-1',
  email: 'owner@store.com',
  role: 'store_owner',
  tenantId: 'tenant-uuid-1',
};

const mockSuperAdminUser: JwtPayload = {
  sub: 'admin-uuid-1',
  email: 'admin@pdv.com',
  role: 'super_admin',
  tenantId: null,
};

const mockSalesResult = {
  total: '1500.00',
  orderCount: 30,
  series: [],
};

const mockTopProducts = [
  { productId: 'p1', productName: 'Pão Francês', totalQuantity: 200, totalRevenue: '150.00' },
];

const mockPaymentMethods = [
  { method: 'pix', count: 20, total: '1000.00' },
];

const mockReportService = {
  getSalesReport: jest.fn().mockResolvedValue(mockSalesResult),
  getTopProducts: jest.fn().mockResolvedValue(mockTopProducts),
  getPaymentMethodBreakdown: jest.fn().mockResolvedValue(mockPaymentMethods),
  buildExportCsv: jest.fn().mockResolvedValue('﻿Data,Total,Pedidos\n2026-01-01,500.00,10'),
};

describe('ReportController', () => {
  let controller: ReportController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [
        { provide: ReportService, useValue: mockReportService },
      ],
    }).compile();

    controller = module.get<ReportController>(ReportController);
  });

  describe('getSalesReport', () => {
    it('should call reportService.getSalesReport with tenantId from JWT for store_owner', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31' };
      const result = await controller.getSalesReport(mockOwnerUser, query as never);

      expect(mockReportService.getSalesReport).toHaveBeenCalledWith('tenant-uuid-1', query);
      expect(result).toEqual(mockSalesResult);
    });

    it('should call reportService.getSalesReport with null tenantId for super_admin', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31' };
      await controller.getSalesReport(mockSuperAdminUser, query as never);

      expect(mockReportService.getSalesReport).toHaveBeenCalledWith(null, query);
    });
  });

  describe('getTopProducts', () => {
    it('should call reportService.getTopProducts with tenantId from JWT for store_owner', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31', limit: 10 };
      const result = await controller.getTopProducts(mockOwnerUser, query as never);

      expect(mockReportService.getTopProducts).toHaveBeenCalledWith('tenant-uuid-1', query);
      expect(result).toEqual(mockTopProducts);
    });

    it('should call with null tenantId for super_admin', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31' };
      await controller.getTopProducts(mockSuperAdminUser, query as never);

      expect(mockReportService.getTopProducts).toHaveBeenCalledWith(null, query);
    });
  });

  describe('getPaymentMethods', () => {
    it('should call reportService.getPaymentMethodBreakdown with tenantId from JWT', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31' };
      const result = await controller.getPaymentMethods(mockOwnerUser, query as never);

      expect(mockReportService.getPaymentMethodBreakdown).toHaveBeenCalledWith('tenant-uuid-1', query);
      expect(result).toEqual(mockPaymentMethods);
    });

    it('should call with null tenantId for super_admin', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31' };
      await controller.getPaymentMethods(mockSuperAdminUser, query as never);

      expect(mockReportService.getPaymentMethodBreakdown).toHaveBeenCalledWith(null, query);
    });
  });

  describe('exportReport', () => {
    it('should call reportService.buildExportCsv and send CSV response with headers', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31', type: 'sales' as const };
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.exportReport(mockOwnerUser, query as never, mockRes as never);

      expect(mockReportService.buildExportCsv).toHaveBeenCalledWith('tenant-uuid-1', query);
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', expect.stringContaining('attachment'));
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should use null tenantId for super_admin export', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31', type: 'sales' as const };
      const mockRes = { setHeader: jest.fn(), send: jest.fn() };

      await controller.exportReport(mockSuperAdminUser, query as never, mockRes as never);

      expect(mockReportService.buildExportCsv).toHaveBeenCalledWith(null, query);
    });
  });
});
