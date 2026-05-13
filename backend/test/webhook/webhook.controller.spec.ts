import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from '../../src/modules/webhook/webhook.controller';
import { WebhookService } from '../../src/modules/webhook/webhook.service';

const mockWebhookService = {
  processPaymentWebhook: jest.fn().mockResolvedValue(undefined),
};

describe('WebhookController', () => {
  let controller: WebhookController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        { provide: WebhookService, useValue: mockWebhookService },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
  });

  describe('handleMercadoPago', () => {
    it('should call webhookService.processPaymentWebhook with body and headers', async () => {
      const body = { type: 'payment', data: { id: 'mp-payment-123' } };
      const xSignature = 'ts=12345,v1=abc123';
      const xRequestId = 'req-id-1';

      const result = await controller.handleMercadoPago(body, xSignature, xRequestId);

      expect(mockWebhookService.processPaymentWebhook).toHaveBeenCalledWith(body, xSignature, xRequestId);
      expect(result).toEqual({ received: true });
    });

    it('should return { received: true } regardless of webhook content', async () => {
      const body = { type: 'merchant_order', data: { id: 'some-id' } };

      const result = await controller.handleMercadoPago(body, '', '');

      expect(result).toEqual({ received: true });
    });

    it('should pass empty strings for missing signature headers', async () => {
      const body = { type: 'payment', data: { id: 'mp-123' } };

      await controller.handleMercadoPago(body, '', '');

      expect(mockWebhookService.processPaymentWebhook).toHaveBeenCalledWith(body, '', '');
    });

    it('should propagate service errors', async () => {
      mockWebhookService.processPaymentWebhook.mockRejectedValueOnce(new Error('Processing error'));

      await expect(
        controller.handleMercadoPago({ type: 'payment', data: { id: '1' } }, '', ''),
      ).rejects.toThrow('Processing error');
    });
  });
});
