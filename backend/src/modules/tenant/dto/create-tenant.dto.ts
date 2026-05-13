import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'Padaria do João', description: 'Nome do estabelecimento', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    enum: ['generic', 'bakery', 'retail', 'digital'],
    example: 'bakery',
    description: 'Tipo de negócio',
  })
  @IsString()
  @IsIn(['generic', 'bakery', 'retail', 'digital'], {
    message: 'type must be one of: generic, bakery, retail, digital',
  })
  type!: string;

  @ApiProperty({ example: 'João da Silva', description: 'Nome do proprietário', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ownerName!: string;

  @ApiProperty({ example: 'joao@padaria.com', description: 'Email do proprietário (será o login)' })
  @IsEmail({}, { message: 'ownerEmail must be a valid email' })
  ownerEmail!: string;

  @ApiProperty({ example: 'senha123', description: 'Senha do proprietário', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'ownerPassword must be at least 6 characters' })
  ownerPassword!: string;
}
