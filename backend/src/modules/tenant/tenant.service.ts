import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { TenantRepository } from './tenant.repository';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { Tenant } from '../../database/schema/tenants';
import { DbService } from '../../database/db.service';
import { users } from '../../database/schema/users';
import { eq } from 'drizzle-orm';

export interface TenantListResponse {
  data: TenantResponseDto[];
  meta: {
    page: number;
    total: number;
    limit: number;
  };
}

@Injectable()
export class TenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly dbService: DbService,
  ) {}

  async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<TenantListResponse> {
    const { items, total } = await this.tenantRepository.findAll(
      page,
      limit,
      search,
    );

    return {
      data: items.map((t) => this.mapToResponseDto(t)),
      meta: { page, total, limit },
    };
  }

  async findOne(id: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
    return this.mapToResponseDto(tenant);
  }

  async create(dto: CreateTenantDto): Promise<TenantResponseDto> {
    const existingUser = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, dto.ownerEmail))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException(
        `User with email ${dto.ownerEmail} already exists`,
      );
    }

    const tenantId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(dto.ownerPassword, 12);
    const now = new Date();

    const tenant = await this.tenantRepository.create({
      id: tenantId,
      name: dto.name,
      type: dto.type,
      plan: 'free',
      stockEnabled: false,
      isActive: true,
      settings: null,
      createdAt: now,
      updatedAt: now,
    });

    await this.dbService.db.insert(users).values({
      id: userId,
      tenantId,
      email: dto.ownerEmail,
      passwordHash,
      name: dto.ownerName,
      role: 'store_owner',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return this.mapToResponseDto(tenant);
  }

  async update(id: string, dto: UpdateTenantDto): Promise<TenantResponseDto> {
    const existing = await this.tenantRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }

    const updated = await this.tenantRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async softDelete(id: string): Promise<TenantResponseDto> {
    const existing = await this.tenantRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }

    const deleted = await this.tenantRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }

    return this.mapToResponseDto(deleted);
  }

  private mapToResponseDto(tenant: Tenant): TenantResponseDto {
    return {
      id: tenant.id,
      name: tenant.name,
      type: tenant.type,
      plan: tenant.plan,
      stockEnabled: tenant.stockEnabled,
      isActive: tenant.isActive,
      settings: tenant.settings as Record<string, unknown> | null,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }
}
