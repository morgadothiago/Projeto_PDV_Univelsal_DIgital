import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TenantResponseDto {
  @ApiProperty({ example: 'uuid-do-tenant' })
  id!: string;

  @ApiProperty({ example: 'Padaria do João' })
  name!: string;

  @ApiProperty({ enum: ['generic', 'bakery', 'retail', 'digital'], example: 'bakery' })
  type!: string;

  @ApiProperty({ enum: ['free', 'pro'], example: 'free' })
  plan!: string;

  @ApiProperty({ example: true })
  stockEnabled!: boolean;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({ example: { currency: 'BRL' }, nullable: true })
  settings!: Record<string, unknown> | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}
