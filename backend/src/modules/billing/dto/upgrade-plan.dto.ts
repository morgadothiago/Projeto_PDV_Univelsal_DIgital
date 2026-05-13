import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpgradePlanDto {
  @ApiProperty({
    enum: ['free', 'pro'],
    example: 'pro',
    description: 'Plano desejado: free ou pro',
  })
  @IsEnum(['free', 'pro'], { message: 'Plano inválido. Use: free ou pro' })
  plan!: 'free' | 'pro';
}
