import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ProductRepository, ProductWithCategory } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { ProductResponseDto } from './dto/product-response.dto';

export interface ProductListResponse {
  data: ProductResponseDto[];
  meta: { page: number; total: number; limit: number };
}

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async findAll(tenantId: string, query: ListProductsQueryDto): Promise<ProductListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const { items, total } = await this.productRepository.findAll(tenantId, {
      categoryId: query.categoryId,
      search: query.search,
      isActive: query.isActive,
      page,
      limit,
    });

    return {
      data: items.map((item) => this.mapToResponseDto(item)),
      meta: { page, total, limit },
    };
  }

  async findOne(id: string, tenantId: string): Promise<ProductResponseDto> {
    const result = await this.productRepository.findById(id);
    if (!result || result.product.tenantId !== tenantId) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return this.mapToResponseDto(result);
  }

  async create(tenantId: string, dto: CreateProductDto): Promise<ProductResponseDto> {
    if (dto.categoryId) {
      const category = await this.productRepository.findCategoryByIdAndTenant(
        dto.categoryId,
        tenantId,
      );
      if (!category) {
        throw new BadRequestException(`Category with id ${dto.categoryId} not found`);
      }
    }

    const now = new Date();
    const product = await this.productRepository.create({
      id: randomUUID(),
      tenantId,
      name: dto.name,
      price: String(dto.price),
      unitType: dto.unitType,
      customUnit: dto.customUnit ?? null,
      categoryId: dto.categoryId ?? null,
      stock: '0',
      stockThreshold: dto.stockThreshold !== undefined ? String(dto.stockThreshold) : '5',
      isActive: dto.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });

    const result = await this.productRepository.findById(product.id);
    return this.mapToResponseDto(result!);
  }

  async update(
    id: string,
    tenantId: string,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const existing = await this.productRepository.findByIdAndTenant(id, tenantId);
    if (!existing) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    if (dto.categoryId) {
      const category = await this.productRepository.findCategoryByIdAndTenant(
        dto.categoryId,
        tenantId,
      );
      if (!category) {
        throw new BadRequestException(`Category with id ${dto.categoryId} not found`);
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.price !== undefined) updateData.price = String(dto.price);
    if (dto.unitType !== undefined) updateData.unitType = dto.unitType;
    if (dto.customUnit !== undefined) updateData.customUnit = dto.customUnit;
    if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;
    if (dto.stockThreshold !== undefined) updateData.stockThreshold = String(dto.stockThreshold);
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    await this.productRepository.update(id, updateData);

    const result = await this.productRepository.findById(id);
    return this.mapToResponseDto(result!);
  }

  async remove(id: string, tenantId: string): Promise<ProductResponseDto> {
    const existing = await this.productRepository.findByIdAndTenant(id, tenantId);
    if (!existing) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    const deleted = await this.productRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return this.mapToResponseDto({ product: deleted, category: null });
  }

  private mapToResponseDto(item: ProductWithCategory): ProductResponseDto {
    return {
      id: item.product.id,
      name: item.product.name,
      price: Number(item.product.price),
      unitType: item.product.unitType,
      customUnit: item.product.customUnit,
      stock: Number(item.product.stock),
      stockThreshold: Number(item.product.stockThreshold),
      isActive: item.product.isActive,
      category: item.category ? { id: item.category.id, name: item.category.name } : null,
      createdAt: item.product.createdAt,
      updatedAt: item.product.updatedAt,
    };
  }
}
