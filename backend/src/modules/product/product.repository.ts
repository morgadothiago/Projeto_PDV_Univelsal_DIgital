import { Injectable } from '@nestjs/common';
import { eq, and, ilike, sql, SQL } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { products, Product, NewProduct } from '../../database/schema/products';
import { categories, Category } from '../../database/schema/categories';

export interface ProductWithCategory {
  product: Product;
  category: Pick<Category, 'id' | 'name'> | null;
}

export interface ProductListResult {
  items: ProductWithCategory[];
  total: number;
}

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  isActive?: boolean;
  page: number;
  limit: number;
}

@Injectable()
export class ProductRepository {
  constructor(private readonly dbService: DbService) {}

  async findAll(tenantId: string, filters: ProductFilters): Promise<ProductListResult> {
    const { categoryId, search, isActive, page, limit } = filters;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(products.tenantId, tenantId)];

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }
    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
    }
    if (isActive !== undefined) {
      conditions.push(eq(products.isActive, isActive));
    }

    const whereClause = and(...conditions);

    const [rows, countResult] = await Promise.all([
      this.dbService.db
        .select({
          product: products,
          category: {
            id: categories.id,
            name: categories.name,
          },
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(whereClause)
        .orderBy(products.name)
        .limit(limit)
        .offset(offset),
      this.dbService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(whereClause),
    ]);

    const items: ProductWithCategory[] = rows.map((row) => ({
      product: row.product,
      category: row.category?.id ? (row.category as Pick<Category, 'id' | 'name'>) : null,
    }));

    return { items, total: countResult[0]?.count ?? 0 };
  }

  async findById(id: string): Promise<ProductWithCategory | undefined> {
    const result = await this.dbService.db
      .select({
        product: products,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id))
      .limit(1);

    if (!result[0]) return undefined;

    return {
      product: result[0].product,
      category: result[0].category?.id
        ? (result[0].category as Pick<Category, 'id' | 'name'>)
        : null,
    };
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<Product | undefined> {
    const result = await this.dbService.db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .limit(1);
    return result[0];
  }

  async findCategoryByIdAndTenant(
    categoryId: string,
    tenantId: string,
  ): Promise<Category | undefined> {
    const result = await this.dbService.db
      .select()
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.tenantId, tenantId)))
      .limit(1);
    return result[0];
  }

  async create(data: NewProduct): Promise<Product> {
    const result = await this.dbService.db
      .insert(products)
      .values(data)
      .returning();
    return result[0] as Product;
  }

  async update(id: string, data: Partial<NewProduct>): Promise<Product | undefined> {
    const result = await this.dbService.db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async softDelete(id: string): Promise<Product | undefined> {
    const result = await this.dbService.db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }
}
