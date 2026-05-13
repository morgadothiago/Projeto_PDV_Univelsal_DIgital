import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StockRepository, StockEntryListResult } from './stock.repository';
import { CreateStockEntryDto } from './dto/create-stock-entry.dto';
import { ListStockEntriesQueryDto } from './dto/list-stock-entries-query.dto';
import { StockEntry } from '../../database/schema/stock-entries';
import { Product } from '../../database/schema/products';

export interface StockEntryListResponse {
  data: StockEntry[];
  meta: { page: number; total: number; limit: number };
}

@Injectable()
export class StockService {
  constructor(private readonly stockRepository: StockRepository) {}

  async createEntry(
    tenantId: string,
    userId: string,
    dto: CreateStockEntryDto,
  ): Promise<StockEntry> {
    const product = await this.stockRepository.findProductByIdAndTenant(
      dto.productId,
      tenantId,
    );
    if (!product) {
      throw new NotFoundException(`Product with id ${dto.productId} not found`);
    }

    const currentStock = Number(product.stock);
    const newStock = currentStock + dto.quantity;

    return this.stockRepository.createEntryAndUpdateStock(
      {
        id: randomUUID(),
        tenantId,
        productId: dto.productId,
        quantity: String(dto.quantity),
        reason: dto.reason ?? null,
        createdBy: userId,
        createdAt: new Date(),
      },
      newStock,
    );
  }

  async findEntries(
    tenantId: string,
    query: ListStockEntriesQueryDto,
  ): Promise<StockEntryListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const { items, total } = await this.stockRepository.findEntriesByTenant(
      tenantId,
      query.productId,
      page,
      limit,
    );

    return { data: items, meta: { page, total, limit } };
  }

  async findAlerts(tenantId: string): Promise<Product[]> {
    return this.stockRepository.findLowStockProducts(tenantId);
  }
}
