import { Injectable } from '@nestjs/common';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { users, User, NewUser } from '../../database/schema/users';

export interface UserListResult {
  items: User[];
  total: number;
}

@Injectable()
export class UserRepository {
  constructor(private readonly dbService: DbService) {}

  async findAllByTenantId(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<UserListResult> {
    const offset = (page - 1) * limit;

    const [items, countResult] = await Promise.all([
      this.dbService.db
        .select()
        .from(users)
        .where(eq(users.tenantId, tenantId))
        .limit(limit)
        .offset(offset)
        .orderBy(users.createdAt),
      this.dbService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(eq(users.tenantId, tenantId)),
    ]);

    return {
      items,
      total: countResult[0]?.count ?? 0,
    };
  }

  async findAll(page: number, limit: number): Promise<UserListResult> {
    const offset = (page - 1) * limit;

    const [items, countResult] = await Promise.all([
      this.dbService.db
        .select()
        .from(users)
        .limit(limit)
        .offset(offset)
        .orderBy(users.createdAt),
      this.dbService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(users),
    ]);

    return {
      items,
      total: countResult[0]?.count ?? 0,
    };
  }

  async findById(id: string): Promise<User | undefined> {
    const result = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }

  async findByIdAndTenantId(
    id: string,
    tenantId: string,
  ): Promise<User | undefined> {
    const result = await this.dbService.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)))
      .limit(1);
    return result[0];
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async create(data: NewUser): Promise<User> {
    const result = await this.dbService.db
      .insert(users)
      .values(data)
      .returning();
    return result[0] as User;
  }

  async update(
    id: string,
    data: Partial<NewUser>,
  ): Promise<User | undefined> {
    const result = await this.dbService.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async softDelete(id: string): Promise<User | undefined> {
    const result = await this.dbService.db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async findCashiersByTenantId(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<UserListResult> {
    const offset = (page - 1) * limit;

    const [items, countResult] = await Promise.all([
      this.dbService.db
        .select()
        .from(users)
        .where(
          and(
            eq(users.tenantId, tenantId),
            inArray(users.role, ['cashier']),
          ),
        )
        .limit(limit)
        .offset(offset)
        .orderBy(users.createdAt),
      this.dbService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(
          and(
            eq(users.tenantId, tenantId),
            inArray(users.role, ['cashier']),
          ),
        ),
    ]);

    return {
      items,
      total: countResult[0]?.count ?? 0,
    };
  }
}
