import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../src/modules/auth/auth.service';
import { DbService } from '../../src/database/db.service';

const mockUser = {
  id: 'user-uuid-1',
  tenantId: 'tenant-uuid-1',
  email: 'owner@store.com',
  passwordHash: '$2b$12$hashedpassword',
  name: 'Store Owner',
  role: 'store_owner',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDbSelect = jest.fn();
const mockDbService = {
  db: {
    select: mockDbSelect,
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-access-token'),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'JWT_SECRET') return 'test-secret-32-chars-long-enough';
    if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret-32-chars';
    return undefined;
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DbService, useValue: mockDbService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return user without passwordHash on valid credentials', async () => {
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      const bcrypt = await import('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser('owner@store.com', 'password123');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('passwordHash');
      expect(result?.email).toBe('owner@store.com');
    });

    it('should return null when user is not found', async () => {
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      const result = await service.validateUser('notfound@store.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password does not match', async () => {
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      const bcrypt = await import('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser('owner@store.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([inactiveUser]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      const result = await service.validateUser('owner@store.com', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return accessToken and user data without passwordHash', async () => {
      const { passwordHash: _ph, ...userWithoutHash } = mockUser;
      const result = await service.login(userWithoutHash);

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.role).toBe(mockUser.role);
      expect(result.user.tenantId).toBe(mockUser.tenantId);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should call jwtService.sign with correct payload', async () => {
      const { passwordHash: _ph, ...userWithoutHash } = mockUser;
      await service.login(userWithoutHash);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          tenantId: mockUser.tenantId,
        },
        expect.objectContaining({ expiresIn: '15m' }),
      );
    });
  });

  describe('refreshToken', () => {
    it('should return new accessToken when refresh token is valid', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        tenantId: mockUser.tenantId,
      });

      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockUser]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      const result = await service.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBe('mock-access-token');
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refreshToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user from token does not exist', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'nonexistent-id',
        email: 'ghost@test.com',
        role: 'cashier',
        tenantId: null,
      });

      const selectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockDbSelect.mockReturnValue(selectChain);

      await expect(service.refreshToken('token-with-deleted-user')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
