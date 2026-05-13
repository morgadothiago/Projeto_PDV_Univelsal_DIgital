import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty({ example: 'uuid-do-item' })
  id!: string;

  @ApiProperty({ example: 'uuid-do-produto' })
  productId!: string;

  @ApiProperty({ example: 'Café Espresso' })
  productName!: string;

  @ApiProperty({ example: 5.5 })
  unitPrice!: number;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ example: 11.0 })
  subtotal!: number;
}

export class PaymentResponseDto {
  @ApiProperty({ example: 'uuid-do-pagamento' })
  id!: string;

  @ApiProperty({ enum: ['pix', 'cash', 'credit_card', 'debit_card'], example: 'pix' })
  method!: string;

  @ApiProperty({ example: 11.0 })
  amount!: number;

  @ApiProperty({ enum: ['pending', 'confirmed', 'failed', 'refunded'], example: 'pending' })
  status!: string;

  @ApiPropertyOptional({ example: '00020101021226...', nullable: true })
  pixQrCode!: string | null;

  @ApiPropertyOptional({ example: 'iVBORw0KGgoAAAAN...', nullable: true })
  pixQrCodeBase64!: string | null;

  @ApiPropertyOptional({ example: '12345678', nullable: true })
  externalId!: string | null;

  @ApiPropertyOptional({ example: '2026-01-01T12:00:00.000Z', nullable: true })
  confirmedAt!: Date | null;
}

export class OrderResponseDto {
  @ApiProperty({ example: 'uuid-do-pedido' })
  id!: string;

  @ApiProperty({ example: 'uuid-do-tenant' })
  tenantId!: string;

  @ApiProperty({ example: 'uuid-do-caixa' })
  cashierId!: string;

  @ApiProperty({ enum: ['pending', 'awaiting_payment', 'confirmed', 'cancelled'], example: 'pending' })
  status!: string;

  @ApiProperty({ example: 11.0 })
  total!: number;

  @ApiPropertyOptional({ enum: ['pix', 'cash', 'credit_card', 'debit_card'], nullable: true })
  paymentMethod!: string | null;

  @ApiPropertyOptional({ example: 'cliente@email.com', nullable: true })
  customerEmail!: string | null;

  @ApiPropertyOptional({ example: 'Pedido sem açúcar', nullable: true })
  notes!: string | null;

  @ApiPropertyOptional({ example: '2026-01-01T12:00:00.000Z', nullable: true })
  confirmedAt!: Date | null;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiPropertyOptional({ type: PaymentResponseDto, nullable: true })
  payment!: PaymentResponseDto | null;
}

export class CreateOrderPaymentResponseDto {
  @ApiProperty({ enum: ['pix', 'cash', 'credit_card', 'debit_card'], example: 'pix' })
  method!: string;

  @ApiPropertyOptional({ example: '00020101021226...', nullable: true })
  pixQrCode!: string | null;

  @ApiPropertyOptional({ example: 'iVBORw0KGgoAAAAN...', nullable: true })
  pixQrCodeBase64!: string | null;
}

export class CreateOrderResponseDto {
  @ApiProperty({ example: 'uuid-do-pedido' })
  orderId!: string;

  @ApiProperty({ example: 11.0 })
  total!: number;

  @ApiProperty({ enum: ['pending', 'awaiting_payment', 'confirmed', 'cancelled'], example: 'awaiting_payment' })
  status!: string;

  @ApiProperty({ type: CreateOrderPaymentResponseDto })
  payment!: {
    method: string;
    pixQrCode: string | null;
    pixQrCodeBase64: string | null;
  };
}
