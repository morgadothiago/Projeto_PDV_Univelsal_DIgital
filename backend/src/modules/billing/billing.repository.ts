import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { subscriptions, Subscription, NewSubscription } from '../../database/schema/subscriptions';

@Injectable()
export class BillingRepository {
  constructor(private readonly dbService: DbService) {}

  async findByTenantId(tenantId: string): Promise<Subscription | undefined> {
    const result = await this.dbService.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);
    return result[0];
  }

  async create(data: NewSubscription): Promise<Subscription> {
    const result = await this.dbService.db
      .insert(subscriptions)
      .values(data)
      .returning();
    return result[0] as Subscription;
  }

  async update(id: string, data: Partial<NewSubscription>): Promise<Subscription | undefined> {
    const result = await this.dbService.db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return result[0];
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ items: Subscription[]; total: number }> {
    const offset = (page - 1) * limit;

    const [items, countResult] = await Promise.all([
      this.dbService.db
        .select()
        .from(subscriptions)
        .orderBy(subscriptions.createdAt)
        .limit(limit)
        .offset(offset),
      this.dbService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(subscriptions),
    ]);

    return { items, total: countResult[0]?.count ?? 0 };
  }
}
