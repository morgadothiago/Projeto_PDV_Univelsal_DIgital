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
import { UserService, UserListResponse } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles('super_admin', 'store_owner')
  @ApiOperation({ summary: 'Lista usuários. super_admin vê todos; store_owner vê apenas seus cashiers' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '20' })
  @ApiResponse({ status: 200, description: 'Lista paginada de usuários', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Apenas super_admin e store_owner podem listar usuários' })
  async findAll(
    @CurrentUser() currentUser: JwtPayload,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<UserListResponse> {
    return this.userService.findAll(
      currentUser,
      Math.max(1, parseInt(page, 10) || 1),
      Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
    );
  }

  @Post()
  @Roles('super_admin', 'store_owner')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria novo usuário. store_owner só pode criar cashiers no próprio tenant' })
  @ApiResponse({ status: 201, description: 'Usuário criado', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou email já cadastrado' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'store_owner não pode criar super_admin' })
  async create(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.create(currentUser, dto);
  }

  @Patch(':id')
  @Roles('super_admin', 'store_owner')
  @ApiOperation({ summary: 'Atualiza dados de um usuário' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar este usuário' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(
    @CurrentUser() currentUser: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(currentUser, id, dto);
  }

  @Delete(':id')
  @Roles('super_admin', 'store_owner')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desativa um usuário (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário desativado', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Token JWT ausente ou inválido' })
  @ApiResponse({ status: 403, description: 'Sem permissão para desativar este usuário' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async softDelete(
    @CurrentUser() currentUser: JwtPayload,
    @Param('id') id: string,
  ): Promise<UserResponseDto> {
    return this.userService.softDelete(currentUser, id);
  }
}
