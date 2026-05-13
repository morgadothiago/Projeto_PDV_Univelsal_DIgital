import { IsDateString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportQueryDto {
  @ApiProperty({ example: '2026-01-01', description: 'Data início do período (ISO 8601)' })
  @IsDateString()
  dateFrom!: string;

  @ApiProperty({ example: '2026-12-31', description: 'Data fim do período (ISO 8601)' })
  @IsDateString()
  dateTo!: string;
}

export class ExportReportQueryDto {
  @ApiProperty({ example: '2026-01-01', description: 'Data início do período (ISO 8601)' })
  @IsDateString()
  dateFrom!: string;

  @ApiProperty({ example: '2026-12-31', description: 'Data fim do período (ISO 8601)' })
  @IsDateString()
  dateTo!: string;

  @ApiProperty({ enum: ['sales', 'products'], example: 'sales', description: 'Tipo de relatório a exportar' })
  @IsIn(['sales', 'products'])
  type!: 'sales' | 'products';
}

export class PaymentMethodsQueryDto {
  @ApiProperty({ example: '2026-01-01', description: 'Data início do período (ISO 8601)' })
  @IsDateString()
  dateFrom!: string;

  @ApiProperty({ example: '2026-12-31', description: 'Data fim do período (ISO 8601)' })
  @IsDateString()
  dateTo!: string;
}
