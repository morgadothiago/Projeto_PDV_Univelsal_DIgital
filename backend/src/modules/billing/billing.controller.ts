import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { BillingService, SubscriptionListResponse } from './billing.service';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { UpgradePlanDto } from './dto/upgrade-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('subscription')
  @Roles('store_owner', 'cashier')
  @ApiOperation({ summary: 'Retorna a subscription do tenant autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Subscription encontrada ou criada automaticamente (plano free)',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Role sem permissão de acesso' })
  async getMySubscription(
    @CurrentUser() user: JwtPayload,
  ): Promise<SubscriptionResponseDto> {
    return this.billingService.getMySubscription(user.tenantId as string);
  }

  @Patch('subscription/plan')
  @Roles('store_owner')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza o plano da subscription (upgrade/downgrade)' })
  @ApiResponse({
    status: 200,
    description: 'Plano atualizado com sucesso',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Plano inválido' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas store_owner pode alterar o plano' })
  async upgradePlan(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpgradePlanDto,
  ): Promise<SubscriptionResponseDto> {
    return this.billingService.upgradePlan(user.tenantId as string, dto);
  }

  @Get('subscriptions')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Lista todas as subscriptions (super_admin)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de subscriptions',
    type: SubscriptionResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas super_admin pode listar todas as subscriptions' })
  async getAllSubscriptions(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<SubscriptionListResponse> {
    return this.billingService.getAllSubscriptions(
      Number(page) || 1,
      Number(limit) || 20,
    );
  }
}
