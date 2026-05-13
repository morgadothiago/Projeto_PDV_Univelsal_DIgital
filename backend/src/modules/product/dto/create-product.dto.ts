import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsIn,
  IsUUID,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Café Espresso', description: 'Nome do produto' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 5.5, description: 'Preço em reais', minimum: 0 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({
    enum: ['unit', 'weight', 'digital'],
    example: 'unit',
    description: 'Tipo de unidade: unit (unidade), weight (peso/kg), digital (produto digital)',
  })
  @IsIn(['unit', 'weight', 'digital'])
  unitType!: string;

  @ApiPropertyOptional({ example: 'uuid-da-categoria', description: 'ID da categoria do produto' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 5, default: 5, description: 'Quantidade mínima antes de emitir alerta de estoque' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  stockThreshold?: number;
}
