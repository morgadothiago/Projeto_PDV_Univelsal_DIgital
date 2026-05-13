import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Maria da Silva', description: 'Nome completo do usuário', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'maria@loja.com', description: 'Email de acesso ao sistema' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email!: string;

  @ApiProperty({ example: 'senha123', description: 'Senha de acesso', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'password must be at least 6 characters' })
  password!: string;

  @ApiProperty({
    enum: ['cashier', 'store_owner'],
    example: 'cashier',
    description: 'Papel do usuário no sistema',
  })
  @IsString()
  @IsIn(['cashier', 'store_owner'], {
    message: 'role must be cashier or store_owner',
  })
  role!: string;
}
