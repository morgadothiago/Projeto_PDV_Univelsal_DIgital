import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Bebidas', description: 'Nome da categoria' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
