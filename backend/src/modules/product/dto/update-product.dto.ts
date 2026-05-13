import {
  IsString,
  IsNumber,
  IsIn,
  IsUUID,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Café Espresso', description: 'Nome do produto' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 5.5, description: 'Preço em reais', minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ enum: ['unit', 'weight', 'digital'], example: 'unit' })
  @IsIn(['unit', 'weight', 'digital'])
  @IsOptional()
  unitType?: string;

  @ApiPropertyOptional({ example: 'uuid-da-categoria', description: 'ID da categoria' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 5, minimum: 0, description: 'Quantidade mínima para alerta de estoque' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  stockThreshold?: number;

  @ApiPropertyOptional({ example: true, description: 'Produto ativo ou inativo (soft delete)' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
