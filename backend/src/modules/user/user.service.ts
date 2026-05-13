import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { User } from '../../database/schema/users';

export interface UserListResponse {
  data: UserResponseDto[];
  meta: {
    page: number;
    total: number;
    limit: number;
  };
}

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(
    currentUser: JwtPayload,
    page: number,
    limit: number,
  ): Promise<UserListResponse> {
    if (currentUser.role === 'super_admin') {
      const { items, total } = await this.userRepository.findAll(page, limit);
      return {
        data: items.map((u) => this.mapToResponseDto(u)),
        meta: { page, total, limit },
      };
    }

    if (currentUser.role === 'store_owner' && currentUser.tenantId) {
      const { items, total } = await this.userRepository.findCashiersByTenantId(
        currentUser.tenantId,
        page,
        limit,
      );
      return {
        data: items.map((u) => this.mapToResponseDto(u)),
        meta: { page, total, limit },
      };
    }

    throw new ForbiddenException('Insufficient permissions to list users');
  }

  async create(
    currentUser: JwtPayload,
    dto: CreateUserDto,
  ): Promise<UserResponseDto> {
    if (dto.role === 'super_admin') {
      throw new ForbiddenException('Cannot create a super_admin user');
    }

    if (currentUser.role === 'store_owner') {
      if (dto.role !== 'cashier') {
        throw new ForbiddenException(
          'store_owner can only create cashier users',
        );
      }
      if (!currentUser.tenantId) {
        throw new ForbiddenException('store_owner must have a tenant');
      }
    }

    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    const tenantId =
      currentUser.role === 'super_admin' ? null : currentUser.tenantId;
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const now = new Date();

    const user = await this.userRepository.create({
      id: crypto.randomUUID(),
      tenantId: tenantId ?? null,
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: dto.role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return this.mapToResponseDto(user);
  }

  async update(
    currentUser: JwtPayload,
    id: string,
    dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    await this.resolveUserWithTenantCheck(currentUser, id);

    const updateData: Partial<{
      name: string;
      email: string;
      passwordHash: string;
      isActive: boolean;
    }> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) {
      const emailTaken = await this.userRepository.findByEmail(dto.email);
      if (emailTaken && emailTaken.id !== id) {
        throw new ConflictException(
          `Email ${dto.email} is already in use`,
        );
      }
      updateData.email = dto.email;
    }
    if (dto.password !== undefined) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 12);
    }
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const updated = await this.userRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async softDelete(currentUser: JwtPayload, id: string): Promise<UserResponseDto> {
    await this.resolveUserWithTenantCheck(currentUser, id);

    const deleted = await this.userRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.mapToResponseDto(deleted);
  }

  private async resolveUserWithTenantCheck(
    currentUser: JwtPayload,
    userId: string,
  ): Promise<User> {
    if (currentUser.role === 'super_admin') {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }
      return user;
    }

    if (!currentUser.tenantId) {
      throw new ForbiddenException('No tenant associated with current user');
    }

    const user = await this.userRepository.findByIdAndTenantId(
      userId,
      currentUser.tenantId,
    );
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return user;
  }

  private mapToResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      tenantId: user.tenantId ?? null,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
