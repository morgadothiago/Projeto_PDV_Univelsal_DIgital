import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';

const mockUser = {
  id: 'user-uuid-1',
  tenantId: 'tenant-uuid-1',
  email: 'owner@store.com',
  name: 'Store Owner',
  role: 'store_owner',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAuthResponse = {
  accessToken: 'mock-access-token',
  user: {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    role: mockUser.role,
    tenantId: mockUser.tenantId,
  },
};

const mockAuthService = {
  login: jest.fn().mockResolvedValue(mockAuthResponse),
  refreshToken: jest.fn().mockResolvedValue({ accessToken: 'new-access-token' }),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should call authService.login with the user from request and return response', async () => {
      const req = { user: mockUser };
      const loginDto = { email: 'owner@store.com', password: 'password123' };

      const result = await controller.login(req as typeof req, loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should return accessToken and user data', async () => {
      const req = { user: mockUser };
      const loginDto = { email: 'owner@store.com', password: 'password123' };

      const result = await controller.login(req as typeof req, loginDto);

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.user.email).toBe('owner@store.com');
      expect(result.user.role).toBe('store_owner');
    });

    it('should handle auth service errors gracefully', async () => {
      mockAuthService.login.mockRejectedValueOnce(new Error('DB error'));

      const req = { user: mockUser };
      const loginDto = { email: 'owner@store.com', password: 'password123' };

      await expect(controller.login(req as typeof req, loginDto)).rejects.toThrow('DB error');
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshToken and return new accessToken', async () => {
      const dto = { refreshToken: 'valid-refresh-token' };
      const result = await controller.refresh(dto);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(result.accessToken).toBe('new-access-token');
    });
  });
});
