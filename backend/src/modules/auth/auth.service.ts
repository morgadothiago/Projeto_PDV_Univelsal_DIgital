import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { DbService } from '../../database/db.service';
import { users } from '../../database/schema/users';
import { tenants } from '../../database/schema/tenants';
import { eq, and, gt } from 'drizzle-orm';
import { JwtPayload } from '../../shared/interfaces/jwt-payload.interface';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../../database/schema/users';

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DbService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const result = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = result[0];
    if (!user) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return null;
    }

    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(user: Omit<User, 'passwordHash'>): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId ?? null,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId ?? null,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const result = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    const user = result[0];
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const newPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId ?? null,
    };

    const accessToken = this.jwtService.sign(newPayload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    return { accessToken };
  }

  async forgotPassword(email: string): Promise<void> {
    const result = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = result[0];
    // Don't reveal if email exists
    if (!user || !user.isActive) {
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1h

    await this.dbService.db
      .update(users)
      .set({ passwordResetToken: token, passwordResetExpiresAt: expiresAt, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/redefinir-senha?token=${token}`;

    const resendKey = this.configService.get<string>('RESEND_API_KEY');
    if (resendKey) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: 'PDV Universal <noreply@pdvuniversal.com.br>',
          to: email,
          subject: 'Recuperação de senha — PDV Universal',
          html: `<p>Clique no link para redefinir sua senha:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Link válido por 1 hora.</p>`,
        });
      } catch (err) {
        console.error('[Resend] Failed to send reset email:', err);
      }
    } else {
      console.log(`[DEV] Reset password link for ${email}: ${resetUrl}`);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const now = new Date();
    const result = await this.dbService.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, token),
          gt(users.passwordResetExpiresAt, now),
        ),
      )
      .limit(1);

    const user = result[0];
    if (!user) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.dbService.db
      .update(users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Email já cadastrado');
    }

    const tenantId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const now = new Date();

    await this.dbService.db.insert(tenants).values({
      id: tenantId,
      name: dto.storeName,
      type: dto.storeType,
      plan: 'free',
      stockEnabled: false,
      isActive: true,
      settings: null,
      createdAt: now,
      updatedAt: now,
    });

    await this.dbService.db.insert(users).values({
      id: userId,
      tenantId,
      email: dto.email,
      passwordHash,
      name: dto.ownerName,
      role: 'store_owner',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const newUser = {
      id: userId,
      tenantId,
      email: dto.email,
      name: dto.ownerName,
      role: 'store_owner',
      isActive: true,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
      createdAt: now,
      updatedAt: now,
    };

    return this.login(newUser);
  }
}
