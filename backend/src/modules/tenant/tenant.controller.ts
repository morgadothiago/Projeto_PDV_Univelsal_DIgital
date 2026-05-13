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
  ApiQuery,
} from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';
import { TenantResponseDto } from './dto/tenant-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  // store_owner / cashier — own tenant
  @Get('me')
  @Roles('store_owner', 'cashier')
  @ApiOperation({ summary: 'Retorna dados do tenant do usuário logado' })
  @ApiResponse({ status: 200, description: 'Dados do tenant', type: TenantResponseDto })
  async getMe(@CurrentUser() user: JwtPayload): Promise<TenantResponseDto> {
    return this.tenantService.getMyTenant(user.tenantId!);
  }

  @Patch('me/settings')
  @Roles('store_owner')
  @ApiOperation({ summary: 'Atualiza cores e logo do tenant (store_owner)' })
  @ApiResponse({ status: 200, description: 'Settings atualizados', type: TenantResponseDto })
  async updateMySettings(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateTenantSettingsDto,
  ): Promise<TenantResponseDto> {
    return this.tenantService.updateMySettings(user.tenantId!, dto);
  }

  // super_admin only
  @Get()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Lista todos os tenants (super_admin)' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '20' })
  @ApiQuery({ name: 'search', required: false, example: 'padaria' })
  @ApiResponse({ status: 200, description: 'Lista paginada de tenants', type: TenantResponseDto })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ): Promise<{ data: TenantResponseDto[]; meta: { page: number; total: number; limit: number } }> {
    return this.tenantService.findAll(
      Math.max(1, parseInt(page, 10) || 1),
      Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
      search,
    );
  }

  @Post()
  @Roles('super_admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria novo tenant com owner — provisiona loja completa' })
  @ApiResponse({ status: 201, description: 'Tenant criado com owner', type: TenantResponseDto })
  async create(@Body() dto: CreateTenantDto): Promise<TenantResponseDto> {
    return this.tenantService.create(dto);
  }

  @Get(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Retorna detalhes de um tenant pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID do tenant' })
  @ApiResponse({ status: 200, description: 'Detalhes do tenant', type: TenantResponseDto })
  async findOne(@Param('id') id: string): Promise<TenantResponseDto> {
    return this.tenantService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Atualiza dados de um tenant' })
  @ApiParam({ name: 'id', description: 'UUID do tenant' })
  @ApiResponse({ status: 200, description: 'Tenant atualizado', type: TenantResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ): Promise<TenantResponseDto> {
    return this.tenantService.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desativa um tenant (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID do tenant' })
  @ApiResponse({ status: 200, description: 'Tenant desativado', type: TenantResponseDto })
  async softDelete(@Param('id') id: string): Promise<TenantResponseDto> {
    return this.tenantService.softDelete(id);
  }
}
