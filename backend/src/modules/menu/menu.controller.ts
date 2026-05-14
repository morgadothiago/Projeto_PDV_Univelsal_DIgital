import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuOrderDto } from './dto/create-menu-order.dto';

// INTENTIONALLY PUBLIC — these endpoints power the cardápio digital (digital menu) feature.
// They are designed to be accessed without authentication so customers can browse the menu
// via QR code / public URL. Queries are scoped to the given tenantId and return only:
//   - active products (isActive = true) with no cost/internal fields
//   - active categories (isActive = true) with id and name only
//   - public tenant branding info (name, logoUrl, primaryColor)
// Sensitive fields (cost, internal notes, passwordHash, etc.) are never selected here.
@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Public — no auth required (cardápio digital)
  @Get(':tenantId/products')
  @ApiOperation({ summary: 'Public menu products for tenant (no auth required)' })
  @ApiParam({ name: 'tenantId', description: 'UUID do tenant' })
  @ApiResponse({ status: 200, description: 'Lista de produtos ativos do cardápio' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  async getProducts(@Param('tenantId') tenantId: string) {
    return this.menuService.getProducts(tenantId);
  }

  // Public — no auth required (cardápio digital)
  @Get(':tenantId/categories')
  @ApiOperation({ summary: 'Public menu categories for tenant (no auth required)' })
  @ApiParam({ name: 'tenantId', description: 'UUID do tenant' })
  @ApiResponse({ status: 200, description: 'Lista de categorias ativas do cardápio' })
  async getCategories(@Param('tenantId') tenantId: string) {
    return this.menuService.getCategories(tenantId);
  }

  // Public — no auth required (cardápio digital)
  @Get(':tenantId/info')
  @ApiOperation({ summary: 'Public tenant branding info for cardápio digital (no auth required)' })
  @ApiParam({ name: 'tenantId', description: 'UUID do tenant' })
  @ApiResponse({
    status: 200,
    description: 'Informações públicas do tenant (nome, logo, cor primária)',
    schema: {
      example: {
        id: 'uuid',
        name: 'Burguer House',
        type: 'generic',
        settings: { logoUrl: 'https://...', primaryColor: '#EA580C' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Loja não encontrada ou inativa' })
  async getTenantInfo(@Param('tenantId') tenantId: string) {
    return this.menuService.getTenantInfo(tenantId);
  }

  // Public — no auth required (self-service cardápio digital order)
  @Post(':tenantId/orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Place a self-service order from cardápio digital (no auth required)' })
  @ApiParam({ name: 'tenantId', description: 'UUID do tenant' })
  @ApiResponse({
    status: 201,
    description: 'Pedido criado com sucesso',
    schema: {
      example: {
        id: 'uuid',
        orderNumber: 'A3F9',
        total: 32.5,
        status: 'pending',
        estimatedMinutes: 20,
        pixQrCode: '00020126...',
        pixQrCodeBase64: 'iVBORw0KGgo...',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou produtos não encontrados' })
  @ApiResponse({ status: 404, description: 'Loja não encontrada ou inativa' })
  async createOrder(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateMenuOrderDto,
  ) {
    return this.menuService.createOrder(tenantId, dto);
  }

  // Public — no auth required (customers poll order + payment status)
  @Get(':tenantId/orders/:orderId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Poll order and payment status (no auth required)' })
  @ApiParam({ name: 'tenantId', description: 'UUID do tenant' })
  @ApiParam({ name: 'orderId', description: 'UUID do pedido' })
  @ApiResponse({
    status: 200,
    description: 'Status do pedido e pagamento',
    schema: {
      example: {
        status: 'pending',
        paymentStatus: 'awaiting_payment',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async getOrderStatus(
    @Param('tenantId') tenantId: string,
    @Param('orderId') orderId: string,
  ): Promise<{ status: string; paymentStatus: string | null }> {
    return this.menuService.getOrderStatus(tenantId, orderId);
  }
}
