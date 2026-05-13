import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { IAdminMetrics } from './interfaces/admin-metrics.interface';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  /**
   * Returns global platform metrics visible only to super_admin.
   */
  async getGlobalMetrics(): Promise<IAdminMetrics> {
    return this.adminRepository.getGlobalMetrics();
  }
}
