import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { UserService } from '../../src/modules/user/user.service';
import { UserRepository } from '../../src/modules/user/user.repository';
import { JwtPayload } from '../../src/shared/interfaces/jwt-payload.interface';

const mockCashier = {
  id: 'user-cashier-1',
  tenantId: 'tenant-uuid-1',
  email: 'cashier@store.com',
  passwordHash: '$2b$12$hashed',
  name: 'John Cashier',
  role: 'cashier',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStoreOwner = {
  id: 'user-owner-1',
  tenantId: 'tenant-uuid-1',
  email: 'owner@store.com',
  passwordHash: '$2b$12$hashed',
  name: 'Store Owner',
  role: 'store_owner',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserRepository = {
  findAll: jest.fn(),
  findAllByTenantId: jest.fn(),
  findCashiersByTenantId: jest.fn(),
  findById: jest.fn(),
  findByIdAndTenantId: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

const superAdminPayload: JwtPayload = {
  sub: 'admin-id',
  email: 'admin@pdvuniversal.com',
  role: 'super_admin',
  tenantId: null,
};

const storeOwnerPayload: JwtPayload = {
  sub: 'owner-id',
  email: 'owner@store.com',
  role: 'store_owner',
  tenantId: 'tenant-uuid-1',
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findAll', () => {
    it('should return all users for super_admin', async () => {
      mockUserRepository.findAll.mockResolvedValue({
        items: [mockStoreOwner, mockCashier],
        total: 2,
      });

      const result = await service.findAll(superAdminPayload, 1, 20);

      expect(mockUserRepository.findAll).toHaveBeenCalledWith(1, 20);
      expect(result.data).toHaveLength(2);
    });

    it('should return only cashiers for store_owner (tenant isolation)', async () => {
      mockUserRepository.findCashiersByTenantId.mockResolvedValue({
        items: [mockCashier],
        total: 1,
      });

      const result = await service.findAll(storeOwnerPayload, 1, 20);

      expect(mockUserRepository.findCashiersByTenantId).toHaveBeenCalledWith(
        'tenant-uuid-1',
        1,
        20,
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].role).toBe('cashier');
    });
  });

  describe('create', () => {
    const createCashierDto = {
      name: 'New Cashier',
      email: 'newcashier@store.com',
      password: 'securepass',
      role: 'cashier',
    };

    it('should create cashier for store_owner within own tenant', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.create.mockResolvedValue(mockCashier);

      const bcrypt = await import('bcrypt');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      const result = await service.create(storeOwnerPayload, createCashierDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-uuid-1',
          role: 'cashier',
        }),
      );
      expect(result).toBeDefined();
    });

    it('should throw ForbiddenException when store_owner tries to create super_admin', async () => {
      const createSuperAdminDto = {
        name: 'Admin',
        email: 'admin@test.com',
        password: 'securepass',
        role: 'super_admin',
      };

      await expect(
        service.create(storeOwnerPayload, createSuperAdminDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when store_owner tries to create store_owner', async () => {
      const createOwnerDto = {
        name: 'Another Owner',
        email: 'another@store.com',
        password: 'securepass',
        role: 'store_owner',
      };

      await expect(
        service.create(storeOwnerPayload, createOwnerDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockCashier);

      await expect(
        service.create(storeOwnerPayload, createCashierDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should enforce tenant isolation — tenantId from JWT not from request', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.create.mockResolvedValue(mockCashier);

      const bcrypt = await import('bcrypt');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed' as never);

      await service.create(storeOwnerPayload, createCashierDto);

      const callArgs = mockUserRepository.create.mock.calls[0][0] as { tenantId: string };
      expect(callArgs.tenantId).toBe('tenant-uuid-1');
    });
  });

  describe('update', () => {
    it('should update user within same tenant for store_owner', async () => {
      mockUserRepository.findByIdAndTenantId.mockResolvedValue(mockCashier);
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.update.mockResolvedValue({ ...mockCashier, name: 'Updated' });

      const result = await service.update(storeOwnerPayload, mockCashier.id, {
        name: 'Updated',
      });

      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when user not in tenant (tenant isolation)', async () => {
      mockUserRepository.findByIdAndTenantId.mockResolvedValue(undefined);

      await expect(
        service.update(storeOwnerPayload, 'other-tenant-user', { name: 'Hack' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should soft delete user within same tenant', async () => {
      mockUserRepository.findByIdAndTenantId.mockResolvedValue(mockCashier);
      mockUserRepository.softDelete.mockResolvedValue({
        ...mockCashier,
        isActive: false,
      });

      const result = await service.softDelete(storeOwnerPayload, mockCashier.id);

      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when targeting user from another tenant', async () => {
      mockUserRepository.findByIdAndTenantId.mockResolvedValue(undefined);

      await expect(
        service.softDelete(storeOwnerPayload, 'other-tenant-user'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
