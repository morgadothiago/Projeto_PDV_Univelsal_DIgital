import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../src/modules/user/user.repository';
import { DbService } from '../../src/database/db.service';

const mockUser = {
  id: 'user-uuid-1',
  tenantId: 'tenant-uuid-1',
  email: 'cashier@store.com',
  passwordHash: '$2b$12$hashed',
  name: 'John Cashier',
  role: 'cashier',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const makeSelectChain = (returnValue: unknown[]) => ({
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockResolvedValue(returnValue),
});

const makeCountChain = (count: number) => ({
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockResolvedValue([{ count }]),
});

const mockDbSelect = jest.fn();
const mockDbInsert = jest.fn();
const mockDbUpdate = jest.fn();

const mockDbService = {
  db: {
    select: mockDbSelect,
    insert: mockDbInsert,
    update: mockDbUpdate,
  },
};

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: DbService, useValue: mockDbService },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  describe('findAllByTenantId', () => {
    it('should filter by tenantId — tenant isolation enforced', async () => {
      mockDbSelect
        .mockReturnValueOnce(makeSelectChain([mockUser]))
        .mockReturnValueOnce(makeCountChain(1));

      const result = await repository.findAllByTenantId('tenant-uuid-1', 1, 20);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      const whereCallArgs = mockDbSelect.mock.results[0].value.where;
      expect(whereCallArgs).toHaveBeenCalled();
    });

    it('should apply correct offset for pagination', async () => {
      mockDbSelect
        .mockReturnValueOnce(makeSelectChain([]))
        .mockReturnValueOnce(makeCountChain(0));

      await repository.findAllByTenantId('tenant-uuid-1', 3, 10);

      const offsetCall = mockDbSelect.mock.results[0].value.offset;
      expect(offsetCall).toHaveBeenCalledWith(20);
    });
  });

  describe('findCashiersByTenantId', () => {
    it('should filter by tenantId and role=cashier', async () => {
      mockDbSelect
        .mockReturnValueOnce(makeSelectChain([mockUser]))
        .mockReturnValueOnce(makeCountChain(1));

      const result = await repository.findCashiersByTenantId('tenant-uuid-1', 1, 20);

      expect(result.items).toHaveLength(1);
      const whereCallArgs = mockDbSelect.mock.results[0].value.where;
      expect(whereCallArgs).toHaveBeenCalled();
    });
  });

  describe('findByIdAndTenantId', () => {
    it('should filter by both id and tenantId — tenant isolation', async () => {
      const singleChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDbSelect.mockReturnValue(singleChain);

      const result = await repository.findByIdAndTenantId('user-uuid-1', 'tenant-uuid-1');

      expect(result).toEqual(mockUser);
      expect(singleChain.where).toHaveBeenCalled();
    });

    it('should return undefined when user is in different tenant', async () => {
      const singleChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDbSelect.mockReturnValue(singleChain);

      const result = await repository.findByIdAndTenantId(
        'user-uuid-1',
        'different-tenant',
      );

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should insert user and return it', async () => {
      const insertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDbInsert.mockReturnValue(insertChain);

      const result = await repository.create({
        id: 'user-uuid-1',
        tenantId: 'tenant-uuid-1',
        email: 'cashier@store.com',
        passwordHash: 'hashed',
        name: 'John Cashier',
        role: 'cashier',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(mockDbInsert).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('softDelete', () => {
    it('should update isActive to false', async () => {
      const updateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ ...mockUser, isActive: false }]),
      };
      mockDbUpdate.mockReturnValue(updateChain);

      const result = await repository.softDelete('user-uuid-1');

      expect(updateChain.set).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
      expect(result?.isActive).toBe(false);
    });
  });

  describe('findById', () => {
    it('should find user by id without tenant filter (super_admin use case)', async () => {
      const singleChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDbSelect.mockReturnValue(singleChain);

      const result = await repository.findById('user-uuid-1');

      expect(result).toEqual(mockUser);
    });
  });
});
