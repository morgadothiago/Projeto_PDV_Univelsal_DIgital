import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsIn,
  IsUUID,
  IsOptional,
  IsBoolean,
  Min,
  MaxLength,
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

  @ApiPropertyOptional({ example: 'm³', description: 'Unidade customizada (ex: m, m², m³, L, saco, barra)' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  customUnit?: string;

  @ApiPropertyOptional({ example: 'uuid-da-categoria', description: 'ID da categoria do produto' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 5, default: 5, description: 'Quantidade mínima antes de emitir alerta de estoque' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  stockThreshold?: number;

  @ApiPropertyOptional({ example: 10, default: 0, description: 'Estoque inicial do produto' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  initialStock?: number;

  @ApiPropertyOptional({ example: true, description: 'Produto ativo (default: true)' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg', description: 'URL ou path da imagem do produto', nullable: true })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
