import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { WebhookService, EfiBankPixWebhookBody } from './webhook.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('efi/pix')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recebe notificação de pagamento PIX via Efi Bank',
    description:
      'Endpoint chamado pelo webhook da Efi Bank quando um PIX é confirmado. ' +
      'A autenticação é feita via mTLS no nível de transporte — sem assinatura no header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processado — pagamento confirmado, estoque baixado',
  })
  @ApiResponse({
    status: 400,
    description: 'Payload malformado',
  })
  async efiPixWebhook(@Body() body: EfiBankPixWebhookBody): Promise<void> {
    await this.webhookService.processEfiPixWebhook(body);
  }
}
