import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { IAdminMetrics } from './interfaces/admin-metrics.interface';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Returns global platform metrics: active tenants, today's orders,
   * today's revenue, and total tenants.
   * Restricted to super_admin role only.
   */
  @Get('metrics')
  @ApiOperation({ summary: 'Métricas globais da plataforma (super_admin)' })
  @ApiResponse({ status: 200, description: 'Métricas: tenants ativos, pedidos do dia, receita do dia' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas super_admin tem acesso às métricas globais' })
  async getMetrics(): Promise<IAdminMetrics> {
    return this.adminService.getGlobalMetrics();
  }
}
