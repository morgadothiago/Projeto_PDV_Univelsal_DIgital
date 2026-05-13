import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { ReportService } from './report.service';
import { SalesReportQueryDto, TopProductsQueryDto } from './dto/sales-report-query.dto';
import { PaymentMethodsQueryDto, ExportReportQueryDto } from './dto/report-query.dto';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('store_owner', 'super_admin')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Relatório de vendas agrupado por período' })
  @ApiResponse({ status: 200, description: 'Dados do relatório de vendas com resumo e séries temporais' })
  @ApiResponse({ status: 400, description: 'Parâmetros de data inválidos' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas store_owner e super_admin têm acesso a relatórios' })
  async getSalesReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: SalesReportQueryDto,
  ): Promise<unknown> {
    const tenantId = user.role === 'super_admin' ? null : user.tenantId;
    return this.reportService.getSalesReport(tenantId, query);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Ranking dos produtos mais vendidos no período' })
  @ApiResponse({ status: 200, description: 'Lista de produtos ordenados por volume de vendas' })
  @ApiResponse({ status: 400, description: 'Parâmetros de data inválidos' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas store_owner e super_admin têm acesso a relatórios' })
  async getTopProducts(
    @CurrentUser() user: JwtPayload,
    @Query() query: TopProductsQueryDto,
  ): Promise<unknown> {
    const tenantId = user.role === 'super_admin' ? null : user.tenantId;
    return this.reportService.getTopProducts(tenantId, query);
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Breakdown de vendas por método de pagamento' })
  @ApiResponse({ status: 200, description: 'Distribuição percentual por método de pagamento' })
  @ApiResponse({ status: 400, description: 'Parâmetros de data inválidos' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas store_owner e super_admin têm acesso a relatórios' })
  async getPaymentMethods(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaymentMethodsQueryDto,
  ): Promise<unknown> {
    const tenantId = user.role === 'super_admin' ? null : user.tenantId;
    return this.reportService.getPaymentMethodBreakdown(tenantId, query);
  }

  @Get('export')
  @ApiOperation({ summary: 'Exporta relatório em formato CSV' })
  @ApiResponse({ status: 200, description: 'Arquivo CSV para download', content: { 'text/csv': {} } })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas store_owner e super_admin podem exportar relatórios' })
  async exportReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: ExportReportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const tenantId = user.role === 'super_admin' ? null : user.tenantId;
    const csv = await this.reportService.buildExportCsv(tenantId, query);
    const filename = `relatorio-${query.type}-${query.dateFrom}-${query.dateTo}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}
