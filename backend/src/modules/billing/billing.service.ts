import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { tenants } from '../../database/schema/tenants';
import { Subscription } from '../../database/schema/subscriptions';
import { BillingRepository } from './billing.repository';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { UpgradePlanDto } from './dto/upgrade-plan.dto';

export interface SubscriptionListResponse {
  data: SubscriptionResponseDto[];
  meta: { page: number; limit: number; total: number };
}

@Injectable()
export class BillingService {
  constructor(
    private readonly billingRepo: BillingRepository,
    private readonly dbService: DbService,
    private readonly configService: ConfigService,
  ) {}

  async getMySubscription(tenantId: string): Promise<SubscriptionResponseDto> {
    let subscription = await this.billingRepo.findByTenantId(tenantId);

    if (!subscription) {
      const now = new Date();
      subscription = await this.billingRepo.create({
        id: randomUUID(),
        tenantId,
        plan: 'free',
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: null,
        mpSubscriptionId: null,
        cancelledAt: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    return this.mapToDto(subscription);
  }

  async upgradePlan(tenantId: string, dto: UpgradePlanDto): Promise<SubscriptionResponseDto> {
    let subscription = await this.billingRepo.findByTenantId(tenantId);

    if (!subscription) {
      const now = new Date();
      subscription = await this.billingRepo.create({
        id: randomUUID(),
        tenantId,
        plan: 'free',
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: null,
        mpSubscriptionId: null,
        cancelledAt: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    const now = new Date();

    if (dto.plan === 'pro') {
      const mpToken = this.configService.get<string>('MP_ACCESS_TOKEN');

      if (!mpToken) {
        console.log('[Billing] MP_ACCESS_TOKEN not configured — using mock upgrade');
      } else {
        // TODO: create MercadoPago subscription here
        // const mp = new MercadoPagoConfig({ accessToken: mpToken });
        // const preapproval = new PreApproval(mp);
        // await preapproval.create({ ... });
      }

      const periodEnd = new Date(now);
      periodEnd.setDate(periodEnd.getDate() + 30);

      const updated = await this.billingRepo.update(subscription.id, {
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: periodEnd,
        cancelledAt: null,
      });

      await this.dbService.db
        .update(tenants)
        .set({ plan: 'pro', updatedAt: now })
        .where(eq(tenants.id, tenantId));

      if (!updated) {
        throw new NotFoundException('Subscription not found after update');
      }

      return this.mapToDto(updated);
    }

    // Downgrade to free
    const updated = await this.billingRepo.update(subscription.id, {
      plan: 'free',
      status: 'active',
      currentPeriodEnd: null,
      cancelledAt: now,
      mpSubscriptionId: null,
    });

    await this.dbService.db
      .update(tenants)
      .set({ plan: 'free', updatedAt: now })
      .where(eq(tenants.id, tenantId));

    if (!updated) {
      throw new NotFoundException('Subscription not found after update');
    }

    return this.mapToDto(updated);
  }

  async getAllSubscriptions(
    page: number,
    limit: number,
  ): Promise<SubscriptionListResponse> {
    const { items, total } = await this.billingRepo.findAll(page, limit);

    return {
      data: items.map((s) => this.mapToDto(s)),
      meta: { page, limit, total },
    };
  }

  private mapToDto(sub: Subscription): SubscriptionResponseDto {
    return {
      id: sub.id,
      tenantId: sub.tenantId,
      plan: sub.plan,
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd ?? null,
      cancelledAt: sub.cancelledAt ?? null,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    };
  }
}
