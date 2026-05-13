import { IsUUID, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockEntryDto {
  @ApiProperty({ example: 'uuid-do-produto', description: 'ID do produto' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 10, minimum: 0.001, description: 'Quantidade a adicionar ao estoque' })
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @ApiPropertyOptional({ example: 'Reposição semanal', description: 'Motivo da entrada de estoque' })
  @IsString()
  @IsOptional()
  reason?: string;
}
