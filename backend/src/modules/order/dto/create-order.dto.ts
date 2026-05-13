import {
  IsArray,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemInputDto {
  @ApiProperty({ example: 'uuid-do-produto', description: 'ID do produto' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 2, minimum: 0.001, description: 'Quantidade (suporta frações para peso)' })
  @IsNumber()
  @Min(0.001)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemInputDto], description: 'Itens do pedido' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items!: OrderItemInputDto[];

  @ApiProperty({
    enum: ['pix', 'cash', 'credit_card', 'debit_card'],
    example: 'pix',
    description: 'Método de pagamento',
  })
  @IsIn(['pix', 'cash', 'credit_card', 'debit_card'])
  paymentMethod!: string;

  @ApiPropertyOptional({ example: 'cliente@email.com', description: 'Email do cliente para envio do recibo' })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;
}
