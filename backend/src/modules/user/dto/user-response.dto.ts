import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-do-usuario' })
  id!: string;

  @ApiPropertyOptional({ example: 'uuid-do-tenant', nullable: true })
  tenantId!: string | null;

  @ApiProperty({ example: 'maria@loja.com' })
  email!: string;

  @ApiProperty({ example: 'Maria da Silva' })
  name!: string;

  @ApiProperty({ enum: ['super_admin', 'store_owner', 'cashier'], example: 'cashier' })
  role!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}
