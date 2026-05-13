import { Test, TestingModule } from '@nestjs/testing';
import { BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from '../../src/modules/payment/payment.service';

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('test-mp-access-token'),
  get: jest.fn().mockReturnValue('test-mp-access-token'),
};

// Mock mercadopago module before importing service
jest.mock('mercadopago', () => {
  const mockPaymentCreate = jest.fn();
  const mockPaymentGet = jest.fn();

  const MockPayment = jest.fn().mockImplementation(() => ({
    create: mockPaymentCreate,
    get: mockPaymentGet,
  }));

  const MockMercadoPagoConfig = jest.fn().mockImplementation(() => ({}));

  return {
    __esModule: true,
    default: MockMercadoPagoConfig,
    Payment: MockPayment,
    _mockPaymentCreate: mockPaymentCreate,
    _mockPaymentGet: mockPaymentGet,
  };
});

describe('PaymentService', () => {
  let service: PaymentService;
  let mockPaymentCreate: jest.Mock;
  let mockPaymentGet: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mp = await import('mercadopago');
    mockPaymentCreate = (mp as unknown as { _mockPaymentCreate: jest.Mock })._mockPaymentCreate;
    mockPaymentGet = (mp as unknown as { _mockPaymentGet: jest.Mock })._mockPaymentGet;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  describe('generatePixQrCode', () => {
    it('should return pixQrCode, pixQrCodeBase64 and externalId on success', async () => {
      mockPaymentCreate.mockResolvedValue({
        id: 12345,
        point_of_interaction: {
          transaction_data: {
            qr_code: 'pix-copia-cola-code',
            qr_code_base64: 'base64encodedimage==',
          },
        },
      });

      const result = await service.generatePixQrCode('order-uuid-1', 25.00, 'tenant-uuid-1', 'customer@test.com');

      expect(result.pixQrCode).toBe('pix-copia-cola-code');
      expect(result.pixQrCodeBase64).toBe('base64encodedimage==');
      expect(result.externalId).toBe('12345');
    });

    it('should use fallback email when customerEmail is not provided', async () => {
      mockPaymentCreate.mockResolvedValue({
        id: 99,
        point_of_interaction: {
          transaction_data: { qr_code: 'code', qr_code_base64: 'base64' },
        },
      });

      await service.generatePixQrCode('order-uuid-1', 10.00, 'tenant-uuid-1');

      expect(mockPaymentCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            payer: expect.objectContaining({
              email: 'order-order-uuid-1@pdv.internal',
            }),
          }),
        }),
      );
    });

    it('should throw BadGatewayException when MP returns no QR code data', async () => {
      mockPaymentCreate.mockResolvedValue({
        id: 1,
        point_of_interaction: { transaction_data: {} },
      });

      await expect(
        service.generatePixQrCode('order-uuid-1', 10.00, 'tenant-uuid-1'),
      ).rejects.toThrow(BadGatewayException);
    });

    it('should throw BadGatewayException when MP API call fails', async () => {
      mockPaymentCreate.mockRejectedValue(new Error('Network error'));

      await expect(
        service.generatePixQrCode('order-uuid-1', 10.00, 'tenant-uuid-1'),
      ).rejects.toThrow(BadGatewayException);
    });

    it('should send orderId as external_reference and correct amount', async () => {
      mockPaymentCreate.mockResolvedValue({
        id: 1,
        point_of_interaction: {
          transaction_data: { qr_code: 'code', qr_code_base64: 'base64' },
        },
      });

      await service.generatePixQrCode('order-uuid-1', 150.00, 'tenant-uuid-1');

      expect(mockPaymentCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            transaction_amount: 150.00,
            external_reference: 'order-uuid-1',
            payment_method_id: 'pix',
          }),
        }),
      );
    });
  });

  describe('fetchPaymentStatus', () => {
    it('should return status and externalReference from MP', async () => {
      mockPaymentGet.mockResolvedValue({
        status: 'approved',
        external_reference: 'order-uuid-1',
      });

      const result = await service.fetchPaymentStatus('mp-payment-123');

      expect(result.status).toBe('approved');
      expect(result.externalReference).toBe('order-uuid-1');
    });

    it('should return "unknown" when MP does not return status', async () => {
      mockPaymentGet.mockResolvedValue({
        status: undefined,
        external_reference: 'order-uuid-1',
      });

      const result = await service.fetchPaymentStatus('mp-payment-123');

      expect(result.status).toBe('unknown');
    });

    it('should throw BadGatewayException when MP fetch fails', async () => {
      mockPaymentGet.mockRejectedValue(new Error('API error'));

      await expect(service.fetchPaymentStatus('mp-payment-123')).rejects.toThrow(BadGatewayException);
    });
  });
});
