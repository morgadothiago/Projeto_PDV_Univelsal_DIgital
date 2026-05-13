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
import { TenantResponseDto } from './dto/tenant-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os tenants (super_admin)' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '20' })
  @ApiQuery({ name: 'search', required: false, example: 'padaria' })
  @ApiResponse({ status: 200, description: 'Lista paginada de tenants', type: TenantResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas super_admin pode listar tenants' })
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria novo tenant com owner — provisiona loja completa' })
  @ApiResponse({ status: 201, description: 'Tenant criado com owner', type: TenantResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou email já cadastrado' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas super_admin pode criar tenants' })
  async create(@Body() dto: CreateTenantDto): Promise<TenantResponseDto> {
    return this.tenantService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna detalhes de um tenant pelo ID' })
  @ApiParam({ name: 'id', description: 'UUID do tenant' })
  @ApiResponse({ status: 200, description: 'Detalhes do tenant', type: TenantResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas super_admin pode acessar tenants' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  async findOne(@Param('id') id: string): Promise<TenantResponseDto> {
    return this.tenantService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados de um tenant' })
  @ApiParam({ name: 'id', description: 'UUID do tenant' })
  @ApiResponse({ status: 200, description: 'Tenant atualizado', type: TenantResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas super_admin pode editar tenants' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ): Promise<TenantResponseDto> {
    return this.tenantService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desativa um tenant (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID do tenant' })
  @ApiResponse({ status: 200, description: 'Tenant desativado', type: TenantResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas super_admin pode desativar tenants' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  async softDelete(@Param('id') id: string): Promise<TenantResponseDto> {
    return this.tenantService.softDelete(id);
  }
}
