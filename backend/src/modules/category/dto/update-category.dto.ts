import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Bebidas', description: 'Nome da categoria' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: true, description: 'Categoria ativa ou inativa' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
