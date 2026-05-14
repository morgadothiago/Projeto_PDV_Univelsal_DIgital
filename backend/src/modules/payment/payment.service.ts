import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Payment } from 'mercadopago';

export interface PixQrCodeResult {
  pixQrCode: string;
  pixQrCodeBase64: string;
  externalId: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private mpClient: MercadoPagoConfig | null = null;

  constructor(private readonly configService: ConfigService) {
    const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
    if (accessToken && accessToken !== 'placeholder') {
      this.mpClient = new MercadoPagoConfig({ accessToken });
    } else {
      this.logger.warn('MP_ACCESS_TOKEN not configured — PIX payments disabled');
    }
  }

  async generatePixQrCode(
    orderId: string,
    amount: number,
    tenantId: string,
    customerEmail?: string,
  ): Promise<PixQrCodeResult> {
    if (!this.mpClient) {
      throw new BadGatewayException('PIX não configurado — MP_ACCESS_TOKEN ausente');
    }
    try {
      const paymentApi = new Payment(this.mpClient);

      const response = await paymentApi.create({
        body: {
          transaction_amount: amount,
          description: `Order ${orderId}`,
          payment_method_id: 'pix',
          external_reference: orderId,
          payer: {
            email: customerEmail ?? `order-${orderId}@pdv.internal`,
          },
          metadata: {
            tenant_id: tenantId,
          },
        },
      });

      const pointOfInteraction = response.point_of_interaction;
      const transactionData = pointOfInteraction?.transaction_data;

      if (!transactionData?.qr_code || !response.id) {
        throw new Error('MercadoPago did not return PIX QR code data');
      }

      return {
        pixQrCode: transactionData.qr_code,
        pixQrCodeBase64: transactionData.qr_code_base64 ?? '',
        externalId: String(response.id),
      };
    } catch (error) {
      this.logger.error('MercadoPago PIX generation failed', error);
      throw new BadGatewayException({
        message: 'Payment gateway error — could not generate PIX QR code',
        code: 'PAYMENT_FAILED',
        statusCode: 502,
      });
    }
  }

  async fetchPaymentStatus(externalId: string): Promise<{
    status: string;
    externalReference: string | null | undefined;
  }> {
    try {
      const paymentApi = new Payment(this.mpClient);
      const response = await paymentApi.get({ id: externalId });
      return {
        status: response.status ?? 'unknown',
        externalReference: response.external_reference,
      };
    } catch (error) {
      this.logger.error('MercadoPago fetch payment failed', error);
      throw new BadGatewayException({
        message: 'Payment gateway error — could not fetch payment status',
        code: 'PAYMENT_FETCH_FAILED',
        statusCode: 502,
      });
    }
  }
}
