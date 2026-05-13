import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OrderService } from '../../src/modules/order/order.service';
import { OrderRepository } from '../../src/modules/order/order.repository';
import { PaymentService } from '../../src/modules/payment/payment.service';
import { NotificationService } from '../../src/modules/notification/notification.service';
import { DbService } from '../../src/database/db.service';

const now = new Date('2026-01-01T10:00:00Z');

const mockOrder = {
  id: 'order-uuid-1',
  tenantId: 'tenant-uuid-1',
  cashierId: 'user-uuid-1',
  status: 'awaiting_payment',
  total: '25.00',
  paymentMethod: 'pix',
  customerEmail: 'client@test.com',
  notes: null,
  confirmedAt: null,
  createdAt: now,
  updatedAt: now,
};

const mockPayment = {
  id: 'payment-uuid-1',
  tenantId: 'tenant-uuid-1',
  orderId: 'order-uuid-1',
  method: 'pix',
  amount: '25.00',
  status: 'pending',
  externalId: null,
  pixQrCode: null,
  pixQrCodeBase64: null,
  confirmedAt: null,
  createdAt: now,
};

const mockOrderItem = {
  id: 'item-uuid-1',
  orderId: 'order-uuid-1',
  productId: 'product-uuid-1',
  productName: 'Pão Francês',
  unitPrice: '0.75',
  quantity: '10',
  subtotal: '7.50',
};

const mockOrderResult = {
  order: mockOrder,
  items: [mockOrderItem],
  payment: mockPayment,
};

const mockProduct = {
  id: 'product-uuid-1',
  tenantId: 'tenant-uuid-1',
  name: 'Pão Francês',
  price: '0.75',
  unitType: 'unit',
  isActive: true,
  stock: '100',
  stockThreshold: '10',
  categoryId: null,
  createdAt: now,
  updatedAt: now,
};

const mockTenant = {
  id: 'tenant-uuid-1',
  name: 'Padaria do João',
  stockEnabled: false,
  isActive: true,
};

const mockOrderRepository = {
  createOrderWithItemsAndPayment: jest.fn(),
  updatePaymentPixData: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findTenantById: jest.fn(),
  cancelOrder: jest.fn(),
  confirmCashOrder: jest.fn(),
  findProductUnitTypes: jest.fn(),
};

const mockPaymentService = {
  generatePixQrCode: jest.fn(),
  fetchPaymentStatus: jest.fn(),
};

const mockNotificationService = {
  sendReceiptEmail: jest.fn(),
};

const mockDbSelect = jest.fn();
const mockDbService = {
  db: {
    select: mockDbSelect,
  },
};

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: OrderRepository, useValue: mockOrderRepository },
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: DbService, useValue: mockDbService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('createOrder', () => {
    const createDto = {
      items: [{ productId: 'product-uuid-1', quantity: 10 }],
      paymentMethod: 'cash' as const,
      customerEmail: undefined,
    };

    beforeEach(() => {
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockProduct]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      mockOrderRepository.createOrderWithItemsAndPayment.mockResolvedValue({
        order: { ...mockOrder, paymentMethod: 'cash', total: '7.50' },
        payment: { ...mockPayment, method: 'cash' },
      });
    });

    it('should create order with correct tenantId and cashierId', async () => {
      const result = await service.createOrder('tenant-uuid-1', 'user-uuid-1', createDto);

      expect(mockOrderRepository.createOrderWithItemsAndPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.objectContaining({
            tenantId: 'tenant-uuid-1',
            cashierId: 'user-uuid-1',
            status: 'awaiting_payment',
          }),
        }),
      );
      expect(result.orderId).toBeDefined();
      expect(result.total).toBe(7.5);
    });

    it('should calculate total from product prices and quantities', async () => {
      const result = await service.createOrder('tenant-uuid-1', 'user-uuid-1', createDto);

      expect(result.total).toBe(7.5);
    });

    it('should throw NotFoundException when product not found in tenant', async () => {
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      await expect(
        service.createOrder('tenant-uuid-1', 'user-uuid-1', {
          items: [{ productId: 'nonexistent', quantity: 1 }],
          paymentMethod: 'cash',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnprocessableEntityException when product is inactive', async () => {
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{ ...mockProduct, isActive: false }]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      await expect(
        service.createOrder('tenant-uuid-1', 'user-uuid-1', createDto),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should generate PIX QR code when paymentMethod is pix', async () => {
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockProduct]),
      };
      mockDbSelect.mockReturnValue(selectChain);
      mockOrderRepository.createOrderWithItemsAndPayment.mockResolvedValue({
        order: mockOrder,
        payment: mockPayment,
      });
      mockPaymentService.generatePixQrCode.mockResolvedValue({
        pixQrCode: 'pix-code-123',
        pixQrCodeBase64: 'base64==',
        externalId: 'mp-payment-1',
      });

      const result = await service.createOrder('tenant-uuid-1', 'user-uuid-1', {
        items: [{ productId: 'product-uuid-1', quantity: 10 }],
        paymentMethod: 'pix',
        customerEmail: 'client@test.com',
      });

      expect(mockPaymentService.generatePixQrCode).toHaveBeenCalled();
      expect(result.payment.pixQrCode).toBe('pix-code-123');
    });
  });

  describe('findAll', () => {
    it('should return paginated orders for tenant', async () => {
      mockOrderRepository.findAll.mockResolvedValue({
        items: [{ order: mockOrder, itemCount: 1 }],
        total: 1,
      });

      const result = await service.findAll('tenant-uuid-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockOrderRepository.findAll).toHaveBeenCalledWith('tenant-uuid-1', 1, 20, expect.any(Object));
    });

    it('should limit to 100 even when query limit exceeds it', async () => {
      mockOrderRepository.findAll.mockResolvedValue({ items: [], total: 0 });

      await service.findAll('tenant-uuid-1', { page: 1, limit: 500 });

      expect(mockOrderRepository.findAll).toHaveBeenCalledWith('tenant-uuid-1', 1, 100, expect.any(Object));
    });
  });

  describe('findOne', () => {
    it('should return order when found and belongs to tenant', async () => {
      mockOrderRepository.findById.mockResolvedValue(mockOrderResult);

      const result = await service.findOne('order-uuid-1', 'tenant-uuid-1');

      expect(result.id).toBe('order-uuid-1');
      expect(result.total).toBe(25);
      expect(result.items).toHaveLength(1);
    });

    it('should throw NotFoundException when order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(undefined);

      await expect(service.findOne('nonexistent', 'tenant-uuid-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order and restore stock when tenant has stockEnabled', async () => {
      const pendingOrder = { ...mockOrder, status: 'awaiting_payment' };
      mockOrderRepository.findById.mockResolvedValue({ ...mockOrderResult, order: pendingOrder });
      mockOrderRepository.findTenantById.mockResolvedValue({ ...mockTenant, stockEnabled: true });
      mockOrderRepository.findProductUnitTypes.mockResolvedValue({ 'product-uuid-1': 'unit' });
      mockOrderRepository.cancelOrder.mockResolvedValue({ id: 'order-uuid-1', status: 'cancelled' });

      const result = await service.cancelOrder('order-uuid-1', 'user-uuid-1', 'store_owner', 'tenant-uuid-1');

      expect(result.status).toBe('cancelled');
      expect(mockOrderRepository.cancelOrder).toHaveBeenCalledWith(
        'order-uuid-1', 'tenant-uuid-1', true, expect.any(Array), expect.any(Object),
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(undefined);

      await expect(
        service.cancelOrder('nonexistent', 'user-uuid-1', 'store_owner', 'tenant-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when cashier tries to cancel another cashier order', async () => {
      const otherCashierOrder = { ...mockOrder, status: 'pending', cashierId: 'other-cashier' };
      mockOrderRepository.findById.mockResolvedValue({ ...mockOrderResult, order: otherCashierOrder });

      await expect(
        service.cancelOrder('order-uuid-1', 'user-uuid-1', 'cashier', 'tenant-uuid-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when order status is not cancellable', async () => {
      const confirmedOrder = { ...mockOrder, status: 'confirmed' };
      mockOrderRepository.findById.mockResolvedValue({ ...mockOrderResult, order: confirmedOrder });

      await expect(
        service.cancelOrder('order-uuid-1', 'user-uuid-1', 'store_owner', 'tenant-uuid-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmCashOrder', () => {
    it('should confirm cash order and deduct stock when stockEnabled', async () => {
      const cashOrder = { ...mockOrder, paymentMethod: 'cash', status: 'awaiting_payment', customerEmail: null };
      mockOrderRepository.findById.mockResolvedValue({ ...mockOrderResult, order: cashOrder, payment: mockPayment });
      mockOrderRepository.findTenantById.mockResolvedValue({ ...mockTenant, stockEnabled: true });
      mockOrderRepository.findProductUnitTypes.mockResolvedValue({ 'product-uuid-1': 'unit' });
      mockOrderRepository.confirmCashOrder.mockResolvedValue({ id: 'order-uuid-1', status: 'confirmed' });

      const result = await service.confirmCashOrder('order-uuid-1', 'tenant-uuid-1');

      expect(result.status).toBe('confirmed');
      expect(mockOrderRepository.confirmCashOrder).toHaveBeenCalledWith(
        'order-uuid-1', 'tenant-uuid-1', mockPayment.id, true, expect.any(Array), expect.any(Object),
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(undefined);

      await expect(service.confirmCashOrder('nonexistent', 'tenant-uuid-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when payment method is not cash/card', async () => {
      const pixOrder = { ...mockOrder, paymentMethod: 'pix', status: 'awaiting_payment' };
      mockOrderRepository.findById.mockResolvedValue({ ...mockOrderResult, order: pixOrder });

      await expect(service.confirmCashOrder('order-uuid-1', 'tenant-uuid-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when order status is already confirmed', async () => {
      const confirmedOrder = { ...mockOrder, paymentMethod: 'cash', status: 'confirmed' };
      mockOrderRepository.findById.mockResolvedValue({ ...mockOrderResult, order: confirmedOrder });

      await expect(service.confirmCashOrder('order-uuid-1', 'tenant-uuid-1')).rejects.toThrow(BadRequestException);
    });

    it('should send receipt email when customerEmail is present', async () => {
      const cashOrder = { ...mockOrder, paymentMethod: 'cash', status: 'awaiting_payment', customerEmail: 'client@test.com' };
      mockOrderRepository.findById.mockResolvedValue({ ...mockOrderResult, order: cashOrder });
      mockOrderRepository.findTenantById.mockResolvedValue({ ...mockTenant, stockEnabled: false });
      mockOrderRepository.findProductUnitTypes.mockResolvedValue({});
      mockOrderRepository.confirmCashOrder.mockResolvedValue({ id: 'order-uuid-1', status: 'confirmed' });

      // OrderService queries tenants table directly via dbService.db.select
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ name: 'Padaria do João' }]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      await service.confirmCashOrder('order-uuid-1', 'tenant-uuid-1');

      expect(mockNotificationService.sendReceiptEmail).toHaveBeenCalledWith(
        expect.objectContaining({ customerEmail: 'client@test.com' }),
      );
    });

    it('should confirm cash order without stock deduction when stockEnabled is false', async () => {
      const cashOrder = { ...mockOrder, paymentMethod: 'cash', status: 'awaiting_payment', customerEmail: null };
      mockOrderRepository.findById.mockResolvedValue({ ...mockOrderResult, order: cashOrder, payment: mockPayment });
      mockOrderRepository.findTenantById.mockResolvedValue({ ...mockTenant, stockEnabled: false });
      mockOrderRepository.findProductUnitTypes.mockResolvedValue({});
      mockOrderRepository.confirmCashOrder.mockResolvedValue({ id: 'order-uuid-1', status: 'confirmed' });

      const result = await service.confirmCashOrder('order-uuid-1', 'tenant-uuid-1');

      expect(result.status).toBe('confirmed');
      expect(mockOrderRepository.findProductUnitTypes).not.toHaveBeenCalled();
    });
  });
});
