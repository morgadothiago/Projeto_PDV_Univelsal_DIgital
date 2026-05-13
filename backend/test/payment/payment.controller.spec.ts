import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRepository } from '../../src/modules/payment/payment.repository';
import { DbService } from '../../src/database/db.service';

/**
 * PaymentModule does not expose a PaymentController — it is consumed internally by
 * OrderService (PIX generation) and WebhookService (status fetch). These tests
 * validate that PaymentRepository correctly queries the database layer, acting as
 * the "controller-level" integration boundary for this module.
 */

const mockPayment = {
  id: 'payment-uuid-1',
  tenantId: 'tenant-uuid-1',
  orderId: 'order-uuid-1',
  method: 'pix',
  amount: '25.00',
  status: 'pending',
  externalId: null,
  pixQrCode: null,
  confirmedAt: null,
  createdAt: new Date(),
};

const mockOrder = {
  id: 'order-uuid-1',
  tenantId: 'tenant-uuid-1',
  cashierId: 'user-uuid-1',
  status: 'awaiting_payment',
  total: '25.00',
  paymentMethod: 'pix',
  customerEmail: null,
  notes: null,
  confirmedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDbSelect = jest.fn();
const mockDbUpdate = jest.fn();

const mockDbService = {
  db: {
    select: mockDbSelect,
    update: mockDbUpdate,
  },
};

describe('PaymentRepository', () => {
  let repository: PaymentRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentRepository,
        { provide: DbService, useValue: mockDbService },
      ],
    }).compile();

    repository = module.get<PaymentRepository>(PaymentRepository);
  });

  describe('findByOrderId', () => {
    it('should return payment when found by orderId', async () => {
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockPayment]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      const result = await repository.findByOrderId('order-uuid-1');

      expect(result).toEqual(mockPayment);
      expect(selectChain.where).toHaveBeenCalled();
    });

    it('should return undefined when payment not found', async () => {
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      const result = await repository.findByOrderId('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('updatePayment', () => {
    it('should update payment and return updated record', async () => {
      const updatedPayment = { ...mockPayment, status: 'confirmed', confirmedAt: new Date() };
      const updateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedPayment]),
      };
      mockDbUpdate.mockReturnValue(updateChain);

      const result = await repository.updatePayment('payment-uuid-1', {
        status: 'confirmed',
        confirmedAt: new Date(),
      });

      expect(updateChain.set).toHaveBeenCalledWith(expect.objectContaining({ status: 'confirmed' }));
      expect(result?.status).toBe('confirmed');
    });

    it('should return undefined when payment not found for update', async () => {
      const updateChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      mockDbUpdate.mockReturnValue(updateChain);

      const result = await repository.updatePayment('nonexistent', { status: 'confirmed' });

      expect(result).toBeUndefined();
    });
  });

  describe('findOrderWithItemsAndTenant', () => {
    it('should return undefined when order not found', async () => {
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      const result = await repository.findOrderWithItemsAndTenant('nonexistent');

      expect(result).toBeUndefined();
    });

    it('should return order with items and tenant when all exist', async () => {
      const mockTenant = { id: 'tenant-uuid-1', name: 'Padaria', stockEnabled: false, isActive: true };
      const mockItem = { id: 'item-1', orderId: 'order-uuid-1', productId: 'p1', productName: 'Pão', unitPrice: '1', quantity: '2', subtotal: '2' };

      const orderChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockOrder]),
      };
      const itemsChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockItem]),
      };
      const tenantChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockTenant]),
      };

      mockDbSelect
        .mockReturnValueOnce(orderChain)
        .mockReturnValueOnce(itemsChain)
        .mockReturnValueOnce(tenantChain);

      const result = await repository.findOrderWithItemsAndTenant('order-uuid-1');

      expect(result?.order.id).toBe('order-uuid-1');
      expect(result?.items).toHaveLength(1);
      expect(result?.tenant.id).toBe('tenant-uuid-1');
    });
  });
});
