import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TenantService } from '../../src/modules/tenant/tenant.service';
import { TenantRepository } from '../../src/modules/tenant/tenant.repository';
import { DbService } from '../../src/database/db.service';

const mockTenant = {
  id: 'tenant-uuid-1',
  name: 'Padaria do João',
  type: 'bakery',
  plan: 'free',
  stockEnabled: false,
  isActive: true,
  settings: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockTenantRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

const mockDbInsert = jest.fn();
const mockDbSelect = jest.fn();
const mockDbService = {
  db: {
    insert: mockDbInsert,
    select: mockDbSelect,
  },
};

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: TenantRepository, useValue: mockTenantRepository },
        { provide: DbService, useValue: mockDbService },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  describe('findAll', () => {
    it('should return paginated tenants list', async () => {
      mockTenantRepository.findAll.mockResolvedValue({
        items: [mockTenant],
        total: 1,
      });

      const result = await service.findAll(1, 20, undefined);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });

    it('should pass search parameter to repository', async () => {
      mockTenantRepository.findAll.mockResolvedValue({ items: [], total: 0 });

      await service.findAll(1, 20, 'padaria');

      expect(mockTenantRepository.findAll).toHaveBeenCalledWith(1, 20, 'padaria');
    });

    it('should return empty list when no tenants found', async () => {
      mockTenantRepository.findAll.mockResolvedValue({ items: [], total: 0 });

      const result = await service.findAll(1, 20);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return tenant when found', async () => {
      mockTenantRepository.findById.mockResolvedValue(mockTenant);

      const result = await service.findOne('tenant-uuid-1');

      expect(result.id).toBe('tenant-uuid-1');
      expect(result.name).toBe('Padaria do João');
    });

    it('should throw NotFoundException when tenant not found', async () => {
      mockTenantRepository.findById.mockResolvedValue(undefined);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      name: 'Padaria do João',
      type: 'bakery',
      ownerName: 'João Silva',
      ownerEmail: 'joao@padaria.com',
      ownerPassword: 'securepass123',
    };

    it('should create tenant and store_owner user in sequence', async () => {
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      const insertChain = {
        values: jest.fn().mockResolvedValue(undefined),
      };
      mockDbInsert.mockReturnValue(insertChain);
      mockTenantRepository.create.mockResolvedValue(mockTenant);

      const bcrypt = await import('bcrypt');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

      const result = await service.create(createDto);

      expect(mockTenantRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Padaria do João',
          type: 'bakery',
          plan: 'free',
          isActive: true,
        }),
      );
      expect(mockDbInsert).toHaveBeenCalled();
      expect(result.name).toBe('Padaria do João');
    });

    it('should throw ConflictException if owner email already exists', async () => {
      const existingUser = {
        id: 'existing-user',
        email: 'joao@padaria.com',
      };
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([existingUser]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update tenant when found', async () => {
      mockTenantRepository.findById.mockResolvedValue(mockTenant);
      const updatedTenant = { ...mockTenant, name: 'Updated Name' };
      mockTenantRepository.update.mockResolvedValue(updatedTenant);

      const result = await service.update('tenant-uuid-1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when tenant not found for update', async () => {
      mockTenantRepository.findById.mockResolvedValue(undefined);

      await expect(
        service.update('nonexistent', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should soft delete tenant by setting isActive to false', async () => {
      mockTenantRepository.findById.mockResolvedValue(mockTenant);
      const deletedTenant = { ...mockTenant, isActive: false };
      mockTenantRepository.softDelete.mockResolvedValue(deletedTenant);

      const result = await service.softDelete('tenant-uuid-1');

      expect(result.isActive).toBe(false);
      expect(mockTenantRepository.softDelete).toHaveBeenCalledWith('tenant-uuid-1');
    });

    it('should throw NotFoundException when tenant not found for delete', async () => {
      mockTenantRepository.findById.mockResolvedValue(undefined);

      await expect(service.softDelete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
