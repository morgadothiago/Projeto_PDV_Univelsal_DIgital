import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { categories, Category, NewCategory } from '../../database/schema/categories';

@Injectable()
export class CategoryRepository {
  constructor(private readonly dbService: DbService) {}

  async findAllByTenant(tenantId: string): Promise<Category[]> {
    return this.dbService.db
      .select()
      .from(categories)
      .where(and(eq(categories.tenantId, tenantId), eq(categories.isActive, true)))
      .orderBy(categories.name);
  }

  async findById(id: string, tenantId: string): Promise<Category | undefined> {
    const result = await this.dbService.db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)))
      .limit(1);
    return result[0];
  }

  async create(data: NewCategory): Promise<Category> {
    const result = await this.dbService.db
      .insert(categories)
      .values(data)
      .returning();
    return result[0] as Category;
  }

  async update(id: string, data: Partial<NewCategory>): Promise<Category | undefined> {
    const result = await this.dbService.db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }

  async softDelete(id: string): Promise<Category | undefined> {
    const result = await this.dbService.db
      .update(categories)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return result[0];
  }
}
