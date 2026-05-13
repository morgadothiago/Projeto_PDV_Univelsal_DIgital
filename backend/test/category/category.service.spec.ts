import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CategoryService } from '../../src/modules/category/category.service';
import { CategoryRepository } from '../../src/modules/category/category.repository';

const mockCategory = {
  id: 'category-uuid-1',
  tenantId: 'tenant-uuid-1',
  name: 'Pães',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockCategoryRepository = {
  findAllByTenant: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: CategoryRepository, useValue: mockCategoryRepository },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  describe('findAll', () => {
    it('should return categories filtered by tenantId', async () => {
      mockCategoryRepository.findAllByTenant.mockResolvedValue([mockCategory]);

      const result = await service.findAll('tenant-uuid-1');

      expect(result).toHaveLength(1);
      expect(result[0].tenantId).toBe('tenant-uuid-1');
      expect(mockCategoryRepository.findAllByTenant).toHaveBeenCalledWith('tenant-uuid-1');
    });

    it('should return empty array when no categories found', async () => {
      mockCategoryRepository.findAllByTenant.mockResolvedValue([]);

      const result = await service.findAll('tenant-uuid-1');

      expect(result).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('should create category with correct tenantId', async () => {
      mockCategoryRepository.create.mockResolvedValue(mockCategory);

      const result = await service.create('tenant-uuid-1', { name: 'Pães' });

      expect(mockCategoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-uuid-1',
          name: 'Pães',
          isActive: true,
        }),
      );
      expect(result.tenantId).toBe('tenant-uuid-1');
      expect(result.name).toBe('Pães');
    });

    it('should generate a UUID for the new category', async () => {
      mockCategoryRepository.create.mockResolvedValue(mockCategory);

      await service.create('tenant-uuid-1', { name: 'Bebidas' });

      const callArg = mockCategoryRepository.create.mock.calls[0][0];
      expect(callArg.id).toMatch(/^[0-9a-f-]{36}$/);
    });
  });

  describe('update', () => {
    it('should update category when found and belongs to tenant', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      const updated = { ...mockCategory, name: 'Frios' };
      mockCategoryRepository.update.mockResolvedValue(updated);

      const result = await service.update('category-uuid-1', 'tenant-uuid-1', { name: 'Frios' });

      expect(mockCategoryRepository.update).toHaveBeenCalledWith('category-uuid-1', { name: 'Frios' });
      expect(result.name).toBe('Frios');
    });

    it('should throw NotFoundException when category not found', async () => {
      mockCategoryRepository.findById.mockResolvedValue(undefined);

      await expect(service.update('nonexistent', 'tenant-uuid-1', { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when category belongs to different tenant', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ ...mockCategory, tenantId: 'other-tenant' });

      await expect(service.update('category-uuid-1', 'tenant-uuid-1', { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when update returns undefined', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.update.mockResolvedValue(undefined);

      await expect(service.update('category-uuid-1', 'tenant-uuid-1', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete category when found and belongs to tenant', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      const deleted = { ...mockCategory, isActive: false };
      mockCategoryRepository.softDelete.mockResolvedValue(deleted);

      const result = await service.remove('category-uuid-1', 'tenant-uuid-1');

      expect(mockCategoryRepository.softDelete).toHaveBeenCalledWith('category-uuid-1');
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when category not found for removal', async () => {
      mockCategoryRepository.findById.mockResolvedValue(undefined);

      await expect(service.remove('nonexistent', 'tenant-uuid-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when category belongs to different tenant on remove', async () => {
      mockCategoryRepository.findById.mockResolvedValue({ ...mockCategory, tenantId: 'other-tenant' });

      await expect(service.remove('category-uuid-1', 'tenant-uuid-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when softDelete returns undefined', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.softDelete.mockResolvedValue(undefined);

      await expect(service.remove('category-uuid-1', 'tenant-uuid-1')).rejects.toThrow(NotFoundException);
    });
  });
});
