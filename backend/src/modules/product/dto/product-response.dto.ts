import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductCategoryDto {
  @ApiProperty({ example: 'uuid-da-categoria' })
  id!: string;

  @ApiProperty({ example: 'Bebidas' })
  name!: string;
}

export class ProductResponseDto {
  @ApiProperty({ example: 'uuid-do-produto' })
  id!: string;

  @ApiProperty({ example: 'Café Espresso' })
  name!: string;

  @ApiProperty({ example: 5.5 })
  price!: number;

  @ApiProperty({ enum: ['unit', 'weight', 'digital'], example: 'unit' })
  unitType!: string;

  @ApiProperty({ example: 10 })
  stock!: number;

  @ApiProperty({ example: 5 })
  stockThreshold!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({ type: ProductCategoryDto, nullable: true })
  category!: { id: string; name: string } | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}
