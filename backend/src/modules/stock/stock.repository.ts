import { Injectable } from '@nestjs/common';
import { eq, and, sql, lt, SQL } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { products, Product } from '../../database/schema/products';
import { stockEntries, StockEntry, NewStockEntry } from '../../database/schema/stock-entries';

export interface StockEntryListResult {
  items: StockEntry[];
  total: number;
}

@Injectable()
export class StockRepository {
  constructor(private readonly dbService: DbService) {}

  async findProductByIdAndTenant(
    productId: string,
    tenantId: string,
  ): Promise<Product | undefined> {
    const result = await this.dbService.db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
      .limit(1);
    return result[0];
  }

  async createEntryAndUpdateStock(
    entry: NewStockEntry,
    newStock: number,
  ): Promise<StockEntry> {
    // NeonHttpDatabase doesn't support transactions — run sequentially
    const [inserted] = await this.dbService.db
      .insert(stockEntries)
      .values(entry)
      .returning();

    await this.dbService.db
      .update(products)
      .set({ stock: String(newStock), updatedAt: new Date() })
      .where(eq(products.id, entry.productId));

    return inserted as StockEntry;
  }

  async findEntriesByTenant(
    tenantId: string,
    productId: string | undefined,
    page: number,
    limit: number,
  ): Promise<StockEntryListResult> {
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(stockEntries.tenantId, tenantId)];
    if (productId) {
      conditions.push(eq(stockEntries.productId, productId));
    }

    const whereClause = and(...conditions);

    const [items, countResult] = await Promise.all([
      this.dbService.db
        .select()
        .from(stockEntries)
        .where(whereClause)
        .orderBy(sql`${stockEntries.createdAt} desc`)
        .limit(limit)
        .offset(offset),
      this.dbService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(stockEntries)
        .where(whereClause),
    ]);

    return { items, total: countResult[0]?.count ?? 0 };
  }

  async findLowStockProducts(tenantId: string): Promise<Product[]> {
    return this.dbService.db
      .select()
      .from(products)
      .where(
        and(
          eq(products.tenantId, tenantId),
          eq(products.isActive, true),
          lt(products.stock, products.stockThreshold),
        ),
      )
      .orderBy(products.name);
  }
}
