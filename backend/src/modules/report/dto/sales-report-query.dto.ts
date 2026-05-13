import { IsDateString, IsIn, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SalesReportQueryDto {
  @ApiProperty({ example: '2026-01-01', description: 'Data início do período (ISO 8601)' })
  @IsDateString()
  dateFrom!: string;

  @ApiProperty({ example: '2026-12-31', description: 'Data fim do período (ISO 8601)' })
  @IsDateString()
  dateTo!: string;

  @ApiPropertyOptional({
    enum: ['day', 'week', 'month'],
    example: 'day',
    description: 'Agrupamento temporal dos dados',
  })
  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  groupBy?: 'day' | 'week' | 'month';
}

export class TopProductsQueryDto {
  @ApiProperty({ example: '2026-01-01', description: 'Data início do período (ISO 8601)' })
  @IsDateString()
  dateFrom!: string;

  @ApiProperty({ example: '2026-12-31', description: 'Data fim do período (ISO 8601)' })
  @IsDateString()
  dateTo!: string;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100, description: 'Quantidade máxima de produtos no ranking' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
