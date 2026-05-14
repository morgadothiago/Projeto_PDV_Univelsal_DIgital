import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendReceiptEmailParams {
  customerEmail: string;
  storeName: string;
  orderId: string;
  items: Array<{ productName: string; quantity: number; subtotal: number }>;
  total: number;
  paymentMethod: string;
  confirmedAt: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey && !apiKey.startsWith('re_placeholder')) {
      this.resend = new Resend(apiKey);
    }
    this.fromEmail =
      this.configService.get<string>('FROM_EMAIL') ??
      'PDV Universal <onboarding@resend.dev>';
  }

  async sendReceiptEmail(params: SendReceiptEmailParams): Promise<void> {
    const {
      customerEmail,
      storeName,
      orderId,
      items,
      total,
      paymentMethod,
      confirmedAt,
    } = params;

    const receiptNumber = orderId.slice(0, 8).toUpperCase();
    const subject = `Recibo do seu pedido #${receiptNumber}`;
    const formattedDate = confirmedAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const formattedTotal = total.toFixed(2).replace('.', ',');
    const paymentLabel = this.translatePaymentMethod(paymentMethod);

    const itemRows = items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R$ ${item.subtotal.toFixed(2).replace('.', ',')}</td>
          </tr>`,
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2c3e50;">${storeName}</h2>
  <p style="color: #666;">Obrigado pela sua compra!</p>
  <hr style="border: none; border-top: 1px solid #eee;">
  <h3>Recibo #${receiptNumber}</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr style="background: #f8f9fa;">
        <th style="padding: 8px; text-align: left;">Produto</th>
        <th style="padding: 8px; text-align: center;">Qtd</th>
        <th style="padding: 8px; text-align: right;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="padding: 12px 8px; font-weight: bold; text-align: right;">Total</td>
        <td style="padding: 12px 8px; font-weight: bold; text-align: right; color: #2c3e50;">R$ ${formattedTotal}</td>
      </tr>
    </tfoot>
  </table>
  <hr style="border: none; border-top: 1px solid #eee;">
  <p><strong>Forma de pagamento:</strong> ${paymentLabel}</p>
  <p><strong>Data:</strong> ${formattedDate}</p>
  <p style="color: #999; font-size: 12px; margin-top: 30px;">Este é um recibo automático gerado pelo PDV Universal.</p>
</body>
</html>`;

    if (!this.resend) {
      this.logger.warn(`RESEND_API_KEY not configured — skipping receipt email to ${customerEmail}`);
      return;
    }
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: customerEmail,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send receipt email to ${customerEmail}`, error);
    }
  }

  private translatePaymentMethod(method: string): string {
    const map: Record<string, string> = {
      pix: 'PIX',
      cash: 'Dinheiro',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
    };
    return map[method] ?? method;
  }
}
