import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { products } from '../../database/schema/products';
import { categories } from '../../database/schema/categories';

@Injectable()
export class MenuService {
  constructor(private readonly dbService: DbService) {}

  async getProducts(tenantId: string) {
    const rows = await this.dbService.db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        unitType: products.unitType,
        customUnit: products.customUnit,
        categoryId: products.categoryId,
        categoryName: categories.name,
        stock: products.stock,
        active: products.isActive,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.tenantId, tenantId), eq(products.isActive, true)))
      .orderBy(products.name);

    return {
      items: rows.map((r) => ({
        id: r.id,
        name: r.name,
        price: Number(r.price),
        unitType: r.unitType,
        customUnit: r.customUnit ?? null,
        categoryId: r.categoryId ?? null,
        categoryName: r.categoryName ?? null,
        imageUrl: null,
        stock: Number(r.stock),
        active: r.active,
      })),
    };
  }

  async getCategories(tenantId: string) {
    return this.dbService.db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(and(eq(categories.tenantId, tenantId), eq(categories.isActive, true)))
      .orderBy(categories.name);
  }
}
