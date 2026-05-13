import {
  Controller,
  Get,
  Post,
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
} from '@nestjs/swagger';
import { StockService, StockEntryListResponse } from './stock.service';
import { CreateStockEntryDto } from './dto/create-stock-entry.dto';
import { ListStockEntriesQueryDto } from './dto/list-stock-entries-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { StockEntry } from '../../database/schema/stock-entries';
import { Product } from '../../database/schema/products';

@ApiTags('stock')
@ApiBearerAuth()
@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('store_owner')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('entry')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registra entrada de estoque para um produto' })
  @ApiResponse({ status: 201, description: 'Entrada de estoque registrada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou produto não pertence ao tenant' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas store_owner pode gerenciar estoque' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async createEntry(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateStockEntryDto,
  ): Promise<StockEntry> {
    return this.stockService.createEntry(user.tenantId as string, user.sub, dto);
  }

  @Get('entries')
  @ApiOperation({ summary: 'Lista histórico de entradas de estoque com paginação' })
  @ApiResponse({ status: 200, description: 'Histórico de entradas de estoque' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas store_owner pode visualizar estoque' })
  async findEntries(
    @CurrentUser() user: JwtPayload,
    @Query() query: ListStockEntriesQueryDto,
  ): Promise<StockEntryListResponse> {
    return this.stockService.findEntries(user.tenantId as string, query);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Lista produtos abaixo do threshold de estoque mínimo' })
  @ApiResponse({ status: 200, description: 'Produtos com alerta de estoque baixo' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas store_owner pode visualizar alertas' })
  async findAlerts(@CurrentUser() user: JwtPayload): Promise<Product[]> {
    return this.stockService.findAlerts(user.tenantId as string);
  }
}
