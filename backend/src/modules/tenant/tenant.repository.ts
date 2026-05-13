import { Injectable } from '@nestjs/common';
import { eq, ilike, sql, and, SQL } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { tenants, Tenant, NewTenant } from '../../database/schema/tenants';

export interface TenantListResult {
  items: Tenant[];
  total: number;
}

@Injectable()
export class TenantRepository {
  constructor(private readonly dbService: DbService) {}

  async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<TenantListResult> {
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (search) {
      conditions.push(ilike(tenants.name, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      this.dbService.db
        .select()
        .from(tenants)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(tenants.createdAt),
      this.dbService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(tenants)
        .where(whereClause),
    ]);

    return {
      items,
      total: countResult[0]?.count ?? 0,
    };
  }

  async findById(id: string): Promise<Tenant | undefined> {
    const result = await this.dbService.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);
    return result[0];
  }

  async create(data: NewTenant): Promise<Tenant> {
    const result = await this.dbService.db
      .insert(tenants)
      .values(data)
      .returning();
    return result[0] as Tenant;
  }

  async update(id: string, data: Partial<NewTenant>): Promise<Tenant | undefined> {
    const result = await this.dbService.db
      .update(tenants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return result[0];
  }

  async softDelete(id: string): Promise<Tenant | undefined> {
    const result = await this.dbService.db
      .update(tenants)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return result[0];
  }
}
