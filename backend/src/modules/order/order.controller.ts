import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { CreateOrderResponseDto, OrderResponseDto } from './dto/order-response.dto';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles('cashier')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo pedido (somente cashier)' })
  @ApiResponse({ status: 201, description: 'Pedido criado. Se PIX, retorna QR Code.', type: CreateOrderResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou produto sem estoque' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas cashier pode criar pedidos' })
  async createOrder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    return this.orderService.createOrder(user.tenantId!, user.sub, dto);
  }

  @Get()
  @Roles('store_owner', 'super_admin')
  @ApiOperation({ summary: 'Lista pedidos do tenant com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista paginada de pedidos', type: OrderResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas store_owner e super_admin podem listar pedidos' })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListOrdersQueryDto,
  ) {
    return this.orderService.findAll(user.tenantId, query);
  }

  @Get(':id')
  @Roles('store_owner', 'super_admin', 'cashier')
  @ApiOperation({ summary: 'Retorna detalhes de um pedido pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID do pedido' })
  @ApiResponse({ status: 200, description: 'Detalhes do pedido', type: OrderResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Role sem permissão de acesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.orderService.findOne(id, user.tenantId!);
  }

  @Patch(':id/cancel')
  @Roles('cashier', 'store_owner')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancela um pedido e restaura estoque em transação' })
  @ApiParam({ name: 'id', description: 'UUID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido cancelado e estoque restaurado', type: OrderResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Sem permissão para cancelar este pedido' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async cancelOrder(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.orderService.cancelOrder(id, user.sub, user.role, user.tenantId!);
  }

  @Patch(':id/confirm-cash')
  @Roles('cashier')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirma pagamento em dinheiro e baixa estoque em transação' })
  @ApiParam({ name: 'id', description: 'UUID do pedido' })
  @ApiResponse({ status: 200, description: 'Pedido confirmado e estoque baixado', type: OrderResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas cashier pode confirmar pagamento em dinheiro' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async confirmCashOrder(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.orderService.confirmCashOrder(id, user.tenantId!);
  }
}
