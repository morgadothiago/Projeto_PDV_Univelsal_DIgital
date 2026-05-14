import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MenuService } from './menu.service';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get(':tenantId/products')
  @ApiOperation({ summary: 'Public menu products for tenant' })
  async getProducts(@Param('tenantId') tenantId: string) {
    return this.menuService.getProducts(tenantId);
  }

  @Get(':tenantId/categories')
  @ApiOperation({ summary: 'Public menu categories for tenant' })
  async getCategories(@Param('tenantId') tenantId: string) {
    return this.menuService.getCategories(tenantId);
  }
}
