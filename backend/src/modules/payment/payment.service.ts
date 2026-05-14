import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// sdk-node-apis-efi has no bundled types — declaration file at src/types/sdk-node-apis-efi.d.ts
// eslint-disable-next-line @typescript-eslint/no-require-imports
const EfiPay = require('sdk-node-apis-efi');

export interface PixQrCodeResult {
  pixQrCode: string;
  pixQrCodeBase64: string;
  externalId: string; // txid from Efi Bank charge
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private efiClient: any = null;
  private pixKey: string | null = null;

  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>('EFI_CLIENT_ID');
    const clientSecret = this.configService.get<string>('EFI_CLIENT_SECRET');
    const certBase64 = this.configService.get<string>('EFI_CERT_BASE64');
    const pixKey = this.configService.get<string>('EFI_PIX_KEY');
    const sandbox = this.configService.get<string>('EFI_SANDBOX') === 'true';

    if (!clientId || !clientSecret || !certBase64 || !pixKey) {
      this.logger.warn(
        'Efi Bank credentials not configured — PIX payments disabled',
      );
      return;
    }

    // Cloud deployments pass the P12 certificate as a base64 env var.
    // Write it to a temp file because the SDK requires a file path.
    const certBuffer = Buffer.from(certBase64, 'base64');
    const certDir = join(tmpdir(), 'efi-certs');
    mkdirSync(certDir, { recursive: true });
    const certPath = join(certDir, 'cert.p12');
    writeFileSync(certPath, certBuffer);

    this.pixKey = pixKey;
    this.efiClient = new EfiPay({
      sandbox,
      client_id: clientId,
      client_secret: clientSecret,
      certificate: certPath,
    });

    this.logger.log(`Efi Bank PIX configured (sandbox=${sandbox})`);
  }

  async generatePixQrCode(
    orderId: string,
    amount: number,
    _tenantId: string,
    _customerEmail?: string,
  ): Promise<PixQrCodeResult> {
    if (!this.efiClient || !this.pixKey) {
      throw new BadGatewayException(
        'PIX não configurado — credenciais Efi Bank ausentes',
      );
    }

    try {
      // Step 1 — create an immediate charge (cobrança imediata)
      const chargeBody = {
        calendario: { expiracao: 3600 },
        valor: { original: amount.toFixed(2) },
        chave: this.pixKey,
        infoAdicionais: [{ nome: 'Pedido', valor: orderId }],
      };

      const charge = await this.efiClient.pixCreateImmediateCharge(
        {},
        chargeBody,
      );
      const locId: number = charge.loc.id;
      const txid: string = charge.txid;

      // Step 2 — generate QR Code image from the location id
      const qr = await this.efiClient.pixGenerateQRCode({ id: locId });

      return {
        pixQrCode: qr.qrcode,
        pixQrCodeBase64: qr.imagemQrcode ?? '',
        externalId: txid,
      };
    } catch (error) {
      this.logger.error('Efi Bank PIX generation failed', error);
      throw new BadGatewayException({
        message: 'Payment gateway error — could not generate PIX QR code',
        code: 'PAYMENT_FAILED',
        statusCode: 502,
      });
    }
  }

  async fetchPaymentStatus(txid: string): Promise<{
    status: string;
    externalReference: string | null | undefined;
  }> {
    if (!this.efiClient) {
      throw new BadGatewayException(
        'PIX não configurado — credenciais Efi Bank ausentes',
      );
    }
    try {
      const result = await this.efiClient.pixDetailCharge({ txid });
      // Efi Bank statuses: ATIVA | CONCLUIDA | REMOVIDA_PELO_USUARIO_RECEBEDOR | REMOVIDA_PELO_PSP
      // Normalise to the generic "approved" used by the rest of the codebase
      const status = result.status === 'CONCLUIDA' ? 'approved' : result.status;
      return {
        status,
        externalReference: txid,
      };
    } catch (error) {
      this.logger.error('Efi Bank fetch charge failed', error);
      throw new BadGatewayException('Could not fetch payment status');
    }
  }
}
