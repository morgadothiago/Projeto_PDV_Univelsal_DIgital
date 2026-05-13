import { BadRequestException, Injectable } from '@nestjs/common';
import { ReportRepository, SalesReportResult, TopProductRow, PaymentMethodRow } from './report.repository';
import { SalesReportQueryDto, TopProductsQueryDto } from './dto/sales-report-query.dto';
import { PaymentMethodsQueryDto, ExportReportQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async getSalesReport(
    tenantId: string | null,
    query: SalesReportQueryDto,
  ): Promise<SalesReportResult> {
    if (!query.dateFrom || !query.dateTo) {
      throw new BadRequestException('dateFrom and dateTo are required');
    }
    return this.reportRepository.getSalesReport(
      tenantId,
      query.dateFrom,
      query.dateTo,
      query.groupBy ?? 'day',
    );
  }

  async getTopProducts(
    tenantId: string | null,
    query: TopProductsQueryDto,
  ): Promise<TopProductRow[]> {
    if (!query.dateFrom || !query.dateTo) {
      throw new BadRequestException('dateFrom and dateTo are required');
    }
    return this.reportRepository.getTopProducts(
      tenantId,
      query.dateFrom,
      query.dateTo,
      query.limit ?? 10,
    );
  }

  async getPaymentMethodBreakdown(
    tenantId: string | null,
    query: PaymentMethodsQueryDto,
  ): Promise<PaymentMethodRow[]> {
    if (!query.dateFrom || !query.dateTo) {
      throw new BadRequestException('dateFrom and dateTo are required');
    }
    return this.reportRepository.getPaymentMethodBreakdown(
      tenantId,
      query.dateFrom,
      query.dateTo,
    );
  }

  async buildExportCsv(
    tenantId: string | null,
    query: ExportReportQueryDto,
  ): Promise<string> {
    if (!query.dateFrom || !query.dateTo) {
      throw new BadRequestException('dateFrom and dateTo are required');
    }

    const BOM = '﻿';

    if (query.type === 'sales') {
      const result = await this.reportRepository.getSalesReport(
        tenantId,
        query.dateFrom,
        query.dateTo,
        'day',
      );
      const rows = result.series.map((row) => `${row.date},${row.total},${row.orderCount}`);
      return BOM + ['Data,Total,Pedidos', ...rows].join('\n');
    }

    const products = await this.reportRepository.getTopProducts(
      tenantId,
      query.dateFrom,
      query.dateTo,
      1000,
    );
    const rows = products.map(
      (p) => `${p.productName},${p.totalQuantity},${p.totalRevenue}`,
    );
    return BOM + ['Produto,Quantidade,Receita', ...rows].join('\n');
  }
}
