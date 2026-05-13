import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WebhookService } from '../../src/modules/webhook/webhook.service';
import { PaymentService } from '../../src/modules/payment/payment.service';
import { NotificationService } from '../../src/modules/notification/notification.service';
import { DbService } from '../../src/database/db.service';

const now = new Date('2026-01-01T12:00:00Z');

const mockOrder = {
  id: 'order-uuid-1',
  tenantId: 'tenant-uuid-1',
  cashierId: 'cashier-uuid-1',
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
  confirmedAt: null,
  createdAt: now,
};

const mockTenant = {
  id: 'tenant-uuid-1',
  name: 'Padaria do João',
  stockEnabled: false,
  isActive: true,
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

const mockConfigService = {
  get: jest.fn(),
};

const mockPaymentService = {
  fetchPaymentStatus: jest.fn(),
};

const mockNotificationService = {
  sendReceiptEmail: jest.fn(),
};

const mockDbSelect = jest.fn();
const mockDbTransaction = jest.fn();

const mockDbService = {
  db: {
    select: mockDbSelect,
    transaction: mockDbTransaction,
  },
};

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: DbService, useValue: mockDbService },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  describe('validateMercadoPagoSignature', () => {
    it('should return true when MP_WEBHOOK_SECRET is not configured', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const result = service.validateMercadoPagoSignature(
        'ts=1234,v1=abc',
        'request-id-1',
        'data-id-1',
      );

      expect(result).toBe(true);
    });

    it('should return false when signature header is malformed (no ts or v1)', () => {
      mockConfigService.get.mockReturnValue('test-secret');

      const result = service.validateMercadoPagoSignature(
        'invalid-format',
        'request-id-1',
        'data-id-1',
      );

      expect(result).toBe(false);
    });

    it('should return false when computed HMAC does not match v1', () => {
      mockConfigService.get.mockReturnValue('test-secret');

      const result = service.validateMercadoPagoSignature(
        'ts=1234567890,v1=wronghash',
        'request-id-1',
        'data-id-1',
      );

      expect(result).toBe(false);
    });

    it('should return true when HMAC matches correctly', () => {
      const { createHmac } = require('crypto');
      const secret = 'my-webhook-secret';
      const ts = '1234567890';
      const requestId = 'req-abc';
      const dataId = 'data-123';
      const template = `id:${dataId};request-id:${requestId};ts:${ts}`;
      const v1 = createHmac('sha256', secret).update(template).digest('hex');

      mockConfigService.get.mockReturnValue(secret);

      const result = service.validateMercadoPagoSignature(
        `ts=${ts},v1=${v1}`,
        requestId,
        dataId,
      );

      expect(result).toBe(true);
    });
  });

  describe('processPaymentWebhook', () => {
    beforeEach(() => {
      // Disable signature check for these tests
      mockConfigService.get.mockReturnValue(undefined);
    });

    it('should do nothing when body has no data.id', async () => {
      await service.processPaymentWebhook({ type: 'payment', data: {} }, '', '');

      expect(mockPaymentService.fetchPaymentStatus).not.toHaveBeenCalled();
    });

    it('should do nothing when webhook type is not "payment"', async () => {
      await service.processPaymentWebhook(
        { type: 'merchant_order', data: { id: 'mp-123' } }, '', '',
      );

      expect(mockPaymentService.fetchPaymentStatus).not.toHaveBeenCalled();
    });

    it('should do nothing when MP payment status is not "approved"', async () => {
      mockPaymentService.fetchPaymentStatus.mockResolvedValue({
        status: 'pending',
        externalReference: 'order-uuid-1',
      });

      await service.processPaymentWebhook(
        { type: 'payment', data: { id: 'mp-123' } }, '', '',
      );

      expect(mockDbSelect).not.toHaveBeenCalled();
    });

    it('should confirm order and run transaction when payment is approved', async () => {
      mockPaymentService.fetchPaymentStatus.mockResolvedValue({
        status: 'approved',
        externalReference: 'order-uuid-1',
      });

      const makeSelectChain = (result: unknown[]) => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(result),
      });
      const makeItemsChain = (result: unknown[]) => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(result),
      });

      mockDbSelect
        .mockReturnValueOnce(makeSelectChain([mockOrder]))
        .mockReturnValueOnce(makeSelectChain([mockPayment]))
        .mockReturnValueOnce(makeSelectChain([mockTenant]))
        .mockReturnValueOnce(makeItemsChain([mockOrderItem]));

      mockDbTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
        const tx = {
          update: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([]),
            }),
          }),
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([{ unitType: 'unit' }]),
          }),
        };
        await cb(tx);
      });

      await service.processPaymentWebhook(
        { type: 'payment', data: { id: 'mp-payment-123' } }, '', '',
      );

      expect(mockDbTransaction).toHaveBeenCalled();
    });

    it('should skip order confirmation when order is already confirmed', async () => {
      mockPaymentService.fetchPaymentStatus.mockResolvedValue({
        status: 'approved',
        externalReference: 'order-uuid-1',
      });

      const confirmedOrder = { ...mockOrder, status: 'confirmed' };
      const makeSelectChain = (result: unknown[]) => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(result),
      });

      mockDbSelect.mockReturnValueOnce(makeSelectChain([confirmedOrder]));

      await service.processPaymentWebhook(
        { type: 'payment', data: { id: 'mp-payment-123' } }, '', '',
      );

      expect(mockDbTransaction).not.toHaveBeenCalled();
    });

    it('should send receipt email when order has customerEmail and is approved', async () => {
      mockPaymentService.fetchPaymentStatus.mockResolvedValue({
        status: 'approved',
        externalReference: 'order-uuid-1',
      });

      const makeSelectChain = (result: unknown[]) => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(result),
      });
      const makeItemsChain = (result: unknown[]) => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(result),
      });

      mockDbSelect
        .mockReturnValueOnce(makeSelectChain([mockOrder]))
        .mockReturnValueOnce(makeSelectChain([mockPayment]))
        .mockReturnValueOnce(makeSelectChain([mockTenant]))
        .mockReturnValueOnce(makeItemsChain([mockOrderItem]));

      mockDbTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
        const tx = {
          update: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue([]) }),
          }),
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([{ unitType: 'unit' }]),
          }),
        };
        await cb(tx);
      });

      await service.processPaymentWebhook(
        { type: 'payment', data: { id: 'mp-payment-123' } }, '', '',
      );

      expect(mockNotificationService.sendReceiptEmail).toHaveBeenCalledWith(
        expect.objectContaining({ customerEmail: 'client@test.com' }),
      );
    });
  });
});
