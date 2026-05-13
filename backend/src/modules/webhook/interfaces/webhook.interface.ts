export interface IMercadoPagoWebhookBody {
  id: string;
  type: string;
  data: {
    id: string;
  };
}

export interface IWebhookProcessResult {
  received: boolean;
}
