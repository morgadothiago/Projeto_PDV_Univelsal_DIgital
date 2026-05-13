import {
  IsString,
  IsOptional,
  IsBoolean,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'Padaria do João', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: ['generic', 'bakery', 'retail', 'digital'], example: 'bakery' })
  @IsOptional()
  @IsString()
  @IsIn(['generic', 'bakery', 'retail', 'digital'])
  type?: string;

  @ApiPropertyOptional({ enum: ['free', 'pro'], example: 'pro' })
  @IsOptional()
  @IsString()
  @IsIn(['free', 'pro'])
  plan?: string;

  @ApiPropertyOptional({ example: true, description: 'Habilitar controle de estoque' })
  @IsOptional()
  @IsBoolean()
  stockEnabled?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Tenant ativo ou inativo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
