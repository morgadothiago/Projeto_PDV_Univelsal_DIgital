import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTenantSettingsDto {
  @ApiPropertyOptional({ example: '#2563EB' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ example: 'https://minha-loja.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}
