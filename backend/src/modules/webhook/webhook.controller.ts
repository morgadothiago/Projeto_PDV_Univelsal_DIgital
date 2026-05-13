import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { WebhookService, MercadoPagoWebhookBody } from './webhook.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('mercadopago')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recebe notificação de pagamento do MercadoPago' })
  @ApiHeader({ name: 'x-signature', description: 'Assinatura HMAC do MercadoPago para verificação de autenticidade' })
  @ApiHeader({ name: 'x-request-id', description: 'ID único da requisição do MercadoPago' })
  @ApiResponse({ status: 200, description: 'Webhook processado — pagamento confirmado, estoque baixado' })
  @ApiResponse({ status: 400, description: 'Assinatura inválida ou payload malformado' })
  async handleMercadoPago(
    @Body() body: MercadoPagoWebhookBody,
    @Headers('x-signature') xSignature: string = '',
    @Headers('x-request-id') xRequestId: string = '',
  ): Promise<{ received: boolean }> {
    await this.webhookService.processPaymentWebhook(body, xSignature, xRequestId);
    return { received: true };
  }
}
