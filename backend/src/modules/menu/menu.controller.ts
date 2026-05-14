import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MenuService } from './menu.service';

// INTENTIONALLY PUBLIC — these endpoints power the cardápio digital (digital menu) feature.
// They are designed to be accessed without authentication so customers can browse the menu
// via QR code / public URL. Queries are scoped to the given tenantId and return only:
//   - active products (isActive = true) with no cost/internal fields
//   - active categories (isActive = true) with id and name only
// Sensitive fields (cost, internal notes, passwordHash, etc.) are never selected here.
@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // Public — no auth required (cardápio digital)
  @Get(':tenantId/products')
  @ApiOperation({ summary: 'Public menu products for tenant (no auth required)' })
  async getProducts(@Param('tenantId') tenantId: string) {
    return this.menuService.getProducts(tenantId);
  }

  // Public — no auth required (cardápio digital)
  @Get(':tenantId/categories')
  @ApiOperation({ summary: 'Public menu categories for tenant (no auth required)' })
  async getCategories(@Param('tenantId') tenantId: string) {
    return this.menuService.getCategories(tenantId);
  }
}
