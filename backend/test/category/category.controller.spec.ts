import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../../src/modules/category/category.controller';
import { CategoryService } from '../../src/modules/category/category.service';
import { JwtPayload } from '../../src/shared/interfaces/jwt-payload.interface';

const mockUser: JwtPayload = {
  sub: 'user-uuid-1',
  email: 'owner@store.com',
  role: 'store_owner',
  tenantId: 'tenant-uuid-1',
};

const mockCategory = {
  id: 'category-uuid-1',
  tenantId: 'tenant-uuid-1',
  name: 'Pães',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCategoryService = {
  findAll: jest.fn().mockResolvedValue([mockCategory]),
  create: jest.fn().mockResolvedValue(mockCategory),
  update: jest.fn().mockResolvedValue({ ...mockCategory, name: 'Frios' }),
  remove: jest.fn().mockResolvedValue({ ...mockCategory, isActive: false }),
};

describe('CategoryController', () => {
  let controller: CategoryController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        { provide: CategoryService, useValue: mockCategoryService },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  describe('findAll', () => {
    it('should call categoryService.findAll with tenantId from JWT', async () => {
      const result = await controller.findAll(mockUser);

      expect(mockCategoryService.findAll).toHaveBeenCalledWith('tenant-uuid-1');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Pães');
    });
  });

  describe('create', () => {
    it('should call categoryService.create with tenantId from JWT and dto', async () => {
      const dto = { name: 'Bebidas' };
      const result = await controller.create(mockUser, dto);

      expect(mockCategoryService.create).toHaveBeenCalledWith('tenant-uuid-1', dto);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('should call categoryService.update with id, tenantId from JWT and dto', async () => {
      const dto = { name: 'Frios' };
      const result = await controller.update('category-uuid-1', mockUser, dto);

      expect(mockCategoryService.update).toHaveBeenCalledWith('category-uuid-1', 'tenant-uuid-1', dto);
      expect(result.name).toBe('Frios');
    });
  });

  describe('remove', () => {
    it('should call categoryService.remove with id and tenantId from JWT', async () => {
      const result = await controller.remove('category-uuid-1', mockUser);

      expect(mockCategoryService.remove).toHaveBeenCalledWith('category-uuid-1', 'tenant-uuid-1');
      expect(result.isActive).toBe(false);
    });
  });
});
