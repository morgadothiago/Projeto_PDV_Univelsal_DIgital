export interface IEfiBankPixItem {
  endToEndId: string;
  txid: string;
  valor: string;
  horario: string;
  infoPagador?: string;
}

export interface IEfiBankPixWebhookBody {
  pix?: IEfiBankPixItem[];
}

export interface IWebhookProcessResult {
  received: boolean;
}
