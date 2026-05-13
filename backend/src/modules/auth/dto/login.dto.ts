import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'owner@loja.com', description: 'Email do usuário' })
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @ApiProperty({ example: 'senha123', description: 'Senha do usuário', minLength: 1 })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password!: string;
}
