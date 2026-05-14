declare module 'sdk-node-apis-efi' {
  interface EfiPayOptions {
    sandbox: boolean;
    client_id: string;
    client_secret: string;
    certificate: string;
  }
  class EfiPay {
    constructor(options: EfiPayOptions);
    pixCreateImmediateCharge(
      params: Record<string, unknown>,
      body: Record<string, unknown>,
    ): Promise<{ txid: string; loc: { id: number } }>;
    pixGenerateQRCode(params: { id: number }): Promise<{
      qrcode: string;
      imagemQrcode: string;
    }>;
    pixDetailCharge(params: { txid: string }): Promise<{
      status: string;
      txid: string;
    }>;
    pixConfigWebhook(
      params: { chave: string },
      body: { webhookUrl: string },
    ): Promise<Record<string, unknown>>;
  }
  export = EfiPay;
}
