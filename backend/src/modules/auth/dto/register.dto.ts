import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Padaria do João' })
  @IsString()
  @IsNotEmpty({ message: 'Nome da loja obrigatório' })
  storeName!: string;

  @ApiProperty({ example: 'padaria', enum: ['mercado', 'restaurante', 'padaria', 'lanchonete', 'farmácia', 'outro'] })
  @IsString()
  @IsNotEmpty({ message: 'Tipo de negócio obrigatório' })
  storeType!: string;

  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty({ message: 'Seu nome é obrigatório' })
  ownerName!: string;

  @ApiProperty({ example: 'joao@loja.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @ApiProperty({ example: 'Senha@123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  password!: string;
}
