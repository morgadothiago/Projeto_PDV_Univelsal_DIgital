import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscriptionResponseDto {
  @ApiProperty({ example: 'uuid-da-subscription', description: 'ID da subscription' })
  id!: string;

  @ApiProperty({ example: 'uuid-do-tenant', description: 'ID do tenant' })
  tenantId!: string;

  @ApiProperty({ example: 'free', enum: ['free', 'pro'], description: 'Plano ativo' })
  plan!: string;

  @ApiProperty({
    example: 'active',
    enum: ['active', 'cancelled', 'past_due'],
    description: 'Status da subscription',
  })
  status!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Início do período atual' })
  currentPeriodStart!: Date;

  @ApiPropertyOptional({
    example: '2026-02-01T00:00:00.000Z',
    nullable: true,
    description: 'Fim do período atual (null para free)',
  })
  currentPeriodEnd!: Date | null;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description: 'Data de cancelamento',
  })
  cancelledAt!: Date | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Data de criação' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Data de atualização' })
  updatedAt!: Date;
}
