import { IsDateString, IsIn, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListOrdersQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, description: 'Número da página' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, minimum: 1, description: 'Itens por página' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    enum: ['pending', 'awaiting_payment', 'confirmed', 'cancelled'],
    example: 'confirmed',
    description: 'Filtrar por status do pedido',
  })
  @IsOptional()
  @IsIn(['pending', 'awaiting_payment', 'confirmed', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({ example: 'uuid-do-caixa', description: 'Filtrar por caixa (cashier)' })
  @IsOptional()
  @IsUUID()
  cashierId?: string;

  @ApiPropertyOptional({ example: '2026-01-01', description: 'Data início (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Data fim (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
