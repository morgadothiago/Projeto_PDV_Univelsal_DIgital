import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsIn,
  IsArray,
  ValidateNested,
  IsUUID,
  IsNumber,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MenuOrderItemDto {
  @ApiProperty({ example: 'uuid-do-produto', description: 'ID do produto' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 2, description: 'Quantidade', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 5.5, description: 'Preço unitário em reais', minimum: 0 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateMenuOrderDto {
  @ApiPropertyOptional({ example: 'João Silva', description: 'Nome do cliente' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ example: '11999998888', description: 'Telefone do cliente' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional({ example: 'Mesa 5', description: 'Referência da mesa ou localização' })
  @IsString()
  @IsOptional()
  tableRef?: string;

  @ApiProperty({
    enum: ['pix', 'card', 'cash'],
    example: 'pix',
    description: 'Forma de pagamento',
  })
  @IsIn(['pix', 'card', 'cash'])
  paymentMethod!: 'pix' | 'card' | 'cash';

  @ApiProperty({
    type: [MenuOrderItemDto],
    description: 'Itens do pedido',
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MenuOrderItemDto)
  items!: MenuOrderItemDto[];

  @ApiPropertyOptional({ example: 'Sem cebola', description: 'Observações gerais do pedido' })
  @IsString()
  @IsOptional()
  notes?: string;
}
