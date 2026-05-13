import { Test, TestingModule } from '@nestjs/testing';
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
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSelectChain = {
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockResolvedValue([mockTenant]),
};

const mockCountChain = {
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockResolvedValue([{ count: 1 }]),
};

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

describe('TenantRepository', () => {
  let repository: TenantRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantRepository,
        { provide: DbService, useValue: mockDbService },
      ],
    }).compile();

    repository = module.get<TenantRepository>(TenantRepository);
  });

  describe('findAll', () => {
    it('should query db.select from tenants table', async () => {
      mockDbSelect
        .mockReturnValueOnce(mockSelectChain)
        .mockReturnValueOnce(mockCountChain);

      await repository.findAll(1, 20);

      expect(mockDbSelect).toHaveBeenCalledTimes(2);
      expect(mockSelectChain.from).toHaveBeenCalled();
    });

    it('should apply offset based on page and limit', async () => {
      mockDbSelect
        .mockReturnValueOnce(mockSelectChain)
        .mockReturnValueOnce(mockCountChain);

      await repository.findAll(3, 10);

      expect(mockSelectChain.offset).toHaveBeenCalledWith(20);
    });

    it('should apply ilike filter when search is provided', async () => {
      mockDbSelect
        .mockReturnValueOnce(mockSelectChain)
        .mockReturnValueOnce(mockCountChain);

      await repository.findAll(1, 20, 'padaria');

      expect(mockSelectChain.where).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should query by id and return tenant', async () => {
      const singleChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockTenant]),
      };
      mockDbSelect.mockReturnValue(singleChain);

      const result = await repository.findById('tenant-uuid-1');

      expect(result).toEqual(mockTenant);
      expect(singleChain.where).toHaveBeenCalled();
    });

    it('should return undefined when tenant not found', async () => {
      const singleChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDbSelect.mockReturnValue(singleChain);

      const result = await repository.findById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should insert tenant and return it', async () => {
      const insertChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockTenant]),
      };
      mockDbInsert.mockReturnValue(insertChain);

      const result = await repository.create({
        id: 'tenant-uuid-1',
        name: 'Padaria do João',
        type: 'bakery',
        plan: 'free',
        stockEnabled: false,
        isActive: true,
        settings: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(mockDbInsert).toHaveBeenCalled();
      expect(insertChain.values).toHaveBeenCalled();
      expect(result).toEqual(mockTenant);
    });
  });

  describe('softDelete', () => {
    it('should update isActive to false', async () => {
      const updateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ ...mockTenant, isActive: false }]),
      };
      mockDbUpdate.mockReturnValue(updateChain);

      const result = await repository.softDelete('tenant-uuid-1');

      expect(updateChain.set).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
      expect(result?.isActive).toBe(false);
    });
  });
});
