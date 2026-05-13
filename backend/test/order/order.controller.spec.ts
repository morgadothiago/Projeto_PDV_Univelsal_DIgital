import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../../src/modules/order/order.controller';
import { OrderService } from '../../src/modules/order/order.service';
import { JwtPayload } from '../../src/shared/interfaces/jwt-payload.interface';

const mockCashierUser: JwtPayload = {
  sub: 'cashier-uuid-1',
  email: 'cashier@store.com',
  role: 'cashier',
  tenantId: 'tenant-uuid-1',
};

const mockOwnerUser: JwtPayload = {
  sub: 'owner-uuid-1',
  email: 'owner@store.com',
  role: 'store_owner',
  tenantId: 'tenant-uuid-1',
};

const mockCreateOrderResponse = {
  orderId: 'order-uuid-1',
  total: 7.5,
  status: 'awaiting_payment',
  payment: { method: 'cash', pixQrCode: null, pixQrCodeBase64: null },
};

const mockOrderDetail = {
  id: 'order-uuid-1',
  tenantId: 'tenant-uuid-1',
  cashierId: 'cashier-uuid-1',
  status: 'awaiting_payment',
  total: 7.5,
  paymentMethod: 'cash',
  customerEmail: null,
  notes: null,
  confirmedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
  payment: null,
};

const mockListResponse = {
  data: [{ id: 'order-uuid-1', status: 'awaiting_payment', total: 7.5, itemCount: 1 }],
  meta: { page: 1, total: 1, limit: 20 },
};

const mockOrderService = {
  createOrder: jest.fn().mockResolvedValue(mockCreateOrderResponse),
  findAll: jest.fn().mockResolvedValue(mockListResponse),
  findOne: jest.fn().mockResolvedValue(mockOrderDetail),
  cancelOrder: jest.fn().mockResolvedValue({ id: 'order-uuid-1', status: 'cancelled' }),
  confirmCashOrder: jest.fn().mockResolvedValue({ id: 'order-uuid-1', status: 'confirmed' }),
};

describe('OrderController', () => {
  let controller: OrderController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  describe('createOrder', () => {
    it('should call orderService.createOrder with tenantId and userId from JWT', async () => {
      const dto = { items: [{ productId: 'product-uuid-1', quantity: 10 }], paymentMethod: 'cash' as const };
      const result = await controller.createOrder(mockCashierUser, dto as never);

      expect(mockOrderService.createOrder).toHaveBeenCalledWith('tenant-uuid-1', 'cashier-uuid-1', dto);
      expect(result).toEqual(mockCreateOrderResponse);
    });
  });

  describe('findAll', () => {
    it('should call orderService.findAll with tenantId from JWT', async () => {
      const query = { page: 1, limit: 20 };
      const result = await controller.findAll(mockOwnerUser, query as never);

      expect(mockOrderService.findAll).toHaveBeenCalledWith('tenant-uuid-1', query);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should call orderService.findOne with id and tenantId from JWT', async () => {
      const result = await controller.findOne(mockOwnerUser, 'order-uuid-1');

      expect(mockOrderService.findOne).toHaveBeenCalledWith('order-uuid-1', 'tenant-uuid-1');
      expect(result).toEqual(mockOrderDetail);
    });
  });

  describe('cancelOrder', () => {
    it('should call orderService.cancelOrder with id, userId, role and tenantId from JWT', async () => {
      const result = await controller.cancelOrder(mockCashierUser, 'order-uuid-1');

      expect(mockOrderService.cancelOrder).toHaveBeenCalledWith(
        'order-uuid-1', 'cashier-uuid-1', 'cashier', 'tenant-uuid-1',
      );
      expect(result.status).toBe('cancelled');
    });
  });

  describe('confirmCashOrder', () => {
    it('should call orderService.confirmCashOrder with id and tenantId from JWT', async () => {
      const result = await controller.confirmCashOrder(mockCashierUser, 'order-uuid-1');

      expect(mockOrderService.confirmCashOrder).toHaveBeenCalledWith('order-uuid-1', 'tenant-uuid-1');
      expect(result.status).toBe('confirmed');
    });
  });
});
