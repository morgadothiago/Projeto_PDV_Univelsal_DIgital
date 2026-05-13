import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
  ApiParam,
} from '@nestjs/swagger';
import { ProductService, ProductListResponse } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Roles('store_owner', 'super_admin', 'cashier')
  @ApiOperation({ summary: 'Lista produtos do tenant com paginação e filtros' })
  @ApiResponse({ status: 200, description: 'Lista paginada de produtos', type: ProductResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Role sem permissão de acesso' })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListProductsQueryDto,
  ): Promise<ProductListResponse> {
    return this.productService.findAll(user.tenantId as string, query);
  }

  @Get(':id')
  @Roles('store_owner', 'super_admin', 'cashier')
  @ApiOperation({ summary: 'Retorna um produto pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @ApiResponse({ status: 200, description: 'Produto encontrado', type: ProductResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Role sem permissão de acesso' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductResponseDto> {
    return this.productService.findOne(id, user.tenantId as string);
  }

  @Post()
  @Roles('store_owner', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo produto para o tenant' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos na requisição' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas store_owner e super_admin podem criar produtos' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.create(user.tenantId as string, dto);
  }

  @Patch(':id')
  @Roles('store_owner', 'super_admin')
  @ApiOperation({ summary: 'Atualiza um produto existente' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @ApiResponse({ status: 200, description: 'Produto atualizado', type: ProductResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos na requisição' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas store_owner e super_admin podem editar produtos' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, user.tenantId as string, dto);
  }

  @Delete(':id')
  @Roles('store_owner', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desativa um produto (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID do produto' })
  @ApiResponse({ status: 200, description: 'Produto desativado', type: ProductResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas store_owner e super_admin podem remover produtos' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProductResponseDto> {
    return this.productService.remove(id, user.tenantId as string);
  }
}
