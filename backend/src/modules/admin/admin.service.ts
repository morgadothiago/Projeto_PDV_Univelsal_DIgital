import { Injectable } from '@nestjs/common';
import { AdminRepository, ITenantSummary } from './admin.repository';
import { IAdminMetrics } from './interfaces/admin-metrics.interface';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async getGlobalMetrics(): Promise<IAdminMetrics> {
    return this.adminRepository.getGlobalMetrics();
  }

  async getTenantSummary(tenantId: string): Promise<ITenantSummary> {
    return this.adminRepository.getTenantSummary(tenantId);
  }
}
