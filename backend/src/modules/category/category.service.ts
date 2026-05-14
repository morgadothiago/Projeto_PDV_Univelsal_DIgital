import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '../../database/schema/categories';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async findAll(tenantId: string): Promise<Category[]> {
    return this.categoryRepository.findAllByTenant(tenantId);
  }

  async create(tenantId: string, dto: CreateCategoryDto): Promise<Category> {
    const now = new Date();
    return this.categoryRepository.create({
      id: randomUUID(),
      tenantId,
      name: dto.name,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  async update(id: string, tenantId: string, dto: UpdateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException('Categoria não encontrada');
    }

    const updated = await this.categoryRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return updated;
  }

  async remove(id: string, tenantId: string): Promise<Category> {
    const existing = await this.categoryRepository.findById(id, tenantId);
    if (!existing) {
      throw new NotFoundException('Categoria não encontrada');
    }

    const deleted = await this.categoryRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return deleted;
  }
}
