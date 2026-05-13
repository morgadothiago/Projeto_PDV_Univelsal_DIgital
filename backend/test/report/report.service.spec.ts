import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReportService } from '../../src/modules/report/report.service';
import { ReportRepository } from '../../src/modules/report/report.repository';

const mockSalesResult = {
  total: '1500.00',
  orderCount: 30,
  series: [
    { date: '2026-01-01', total: '500.00', orderCount: 10 },
    { date: '2026-01-02', total: '1000.00', orderCount: 20 },
  ],
};

const mockTopProducts = [
  { productId: 'p1', productName: 'Pão Francês', totalQuantity: 200, totalRevenue: '150.00' },
  { productId: 'p2', productName: 'Croissant', totalQuantity: 50, totalRevenue: '175.00' },
];

const mockPaymentMethods = [
  { method: 'pix', count: 20, total: '1000.00' },
  { method: 'cash', count: 10, total: '500.00' },
];

const mockReportRepository = {
  getSalesReport: jest.fn().mockResolvedValue(mockSalesResult),
  getTopProducts: jest.fn().mockResolvedValue(mockTopProducts),
  getPaymentMethodBreakdown: jest.fn().mockResolvedValue(mockPaymentMethods),
};

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: ReportRepository, useValue: mockReportRepository },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  describe('getSalesReport', () => {
    it('should return sales report filtered by tenantId and date range', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31', groupBy: 'day' as const };
      const result = await service.getSalesReport('tenant-uuid-1', query);

      expect(mockReportRepository.getSalesReport).toHaveBeenCalledWith('tenant-uuid-1', '2026-01-01', '2026-01-31', 'day');
      expect(result.orderCount).toBe(30);
      expect(result.series).toHaveLength(2);
    });

    it('should use "day" as default groupBy when not provided', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31' };
      await service.getSalesReport('tenant-uuid-1', query);

      expect(mockReportRepository.getSalesReport).toHaveBeenCalledWith('tenant-uuid-1', '2026-01-01', '2026-01-31', 'day');
    });

    it('should accept null tenantId for super_admin global view', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31' };
      await service.getSalesReport(null, query);

      expect(mockReportRepository.getSalesReport).toHaveBeenCalledWith(null, '2026-01-01', '2026-01-31', 'day');
    });

    it('should throw BadRequestException when dateFrom is missing', async () => {
      await expect(
        service.getSalesReport('tenant-uuid-1', { dateTo: '2026-01-31' } as never),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when dateTo is missing', async () => {
      await expect(
        service.getSalesReport('tenant-uuid-1', { dateFrom: '2026-01-01' } as never),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTopProducts', () => {
    it('should return top products for tenant and date range', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31', limit: 10 };
      const result = await service.getTopProducts('tenant-uuid-1', query);

      expect(mockReportRepository.getTopProducts).toHaveBeenCalledWith('tenant-uuid-1', '2026-01-01', '2026-01-31', 10);
      expect(result).toHaveLength(2);
      expect(result[0].productName).toBe('Pão Francês');
    });

    it('should use default limit of 10 when not provided', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31' };
      await service.getTopProducts('tenant-uuid-1', query);

      expect(mockReportRepository.getTopProducts).toHaveBeenCalledWith('tenant-uuid-1', '2026-01-01', '2026-01-31', 10);
    });

    it('should throw BadRequestException when dates are missing', async () => {
      await expect(
        service.getTopProducts('tenant-uuid-1', {} as never),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPaymentMethodBreakdown', () => {
    it('should return payment method breakdown for tenant and date range', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31' };
      const result = await service.getPaymentMethodBreakdown('tenant-uuid-1', query);

      expect(mockReportRepository.getPaymentMethodBreakdown).toHaveBeenCalledWith('tenant-uuid-1', '2026-01-01', '2026-01-31');
      expect(result).toHaveLength(2);
      expect(result[0].method).toBe('pix');
    });

    it('should throw BadRequestException when dates are missing', async () => {
      await expect(
        service.getPaymentMethodBreakdown('tenant-uuid-1', {} as never),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('buildExportCsv', () => {
    it('should return sales CSV with BOM and header row', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31', type: 'sales' as const };
      const result = await service.buildExportCsv('tenant-uuid-1', query);

      expect(result).toContain('Data,Total,Pedidos');
      expect(result).toContain('2026-01-01,500.00,10');
    });

    it('should return products CSV with BOM and header row', async () => {
      const query = { dateFrom: '2026-01-01', dateTo: '2026-01-31', type: 'products' as const };
      const result = await service.buildExportCsv('tenant-uuid-1', query);

      expect(result).toContain('Produto,Quantidade,Receita');
      expect(result).toContain('Pão Francês,200,150.00');
    });

    it('should throw BadRequestException when dates are missing', async () => {
      await expect(
        service.buildExportCsv('tenant-uuid-1', { type: 'sales' } as never),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
