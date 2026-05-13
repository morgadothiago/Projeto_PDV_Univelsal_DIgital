import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Maria da Silva', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'maria@loja.com' })
  @IsOptional()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email?: string;

  @ApiPropertyOptional({ example: 'novasenha123', minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'password must be at least 6 characters' })
  password?: string;

  @ApiPropertyOptional({ example: true, description: 'Usuário ativo ou inativo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
