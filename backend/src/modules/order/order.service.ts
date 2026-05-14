import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { DbService } from '../../database/db.service';
import { products } from '../../database/schema/products';
import { tenants } from '../../database/schema/tenants';
import { OrderRepository } from './order.repository';
import { PaymentService } from '../payment/payment.service';
import { NotificationService } from '../notification/notification.service';
import { EventsGateway } from '../events/events.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import {
  CreateOrderResponseDto,
  OrderItemResponseDto,
  OrderResponseDto,
  PaymentResponseDto,
} from './dto/order-response.dto';
import { OrderItem } from '../../database/schema/order-items';
import { Payment } from '../../database/schema/payments';
import { PlanLimitsService } from '../../shared/services/plan-limits.service';

export interface OrderListResponse {
  data: Array<{
    id: string;
    tenantId: string;
    cashierId: string;
    status: string;
    total: number;
    paymentMethod: string | null;
    customerEmail: string | null;
    createdAt: Date;
    itemCount: number;
  }>;
  meta: { page: number; total: number; limit: number };
}

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentService: PaymentService,
    private readonly dbService: DbService,
    private readonly notificationService: NotificationService,
    private readonly eventsGateway: EventsGateway,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async createOrder(
    tenantId: string,
    cashierId: string,
    dto: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    await this.planLimits.checkOrderLimit(tenantId);

    const productIds = dto.items.map((i) => i.productId);

    const foundProducts = await this.dbService.db
      .select()
      .from(products)
      .where(and(eq(products.tenantId, tenantId), inArray(products.id, productIds)));

    const productMap = new Map(foundProducts.map((p) => [p.id, p]));

    const missingId = productIds.find((id) => !productMap.has(id));
    if (missingId) {
      throw new NotFoundException(`Product ${missingId} not found or does not belong to tenant`);
    }

    const inactiveProduct = dto.items.find((item) => !productMap.get(item.productId)!.isActive);
    if (inactiveProduct) {
      throw new UnprocessableEntityException(
        `Product ${inactiveProduct.productId} is inactive`,
      );
    }

    let total = 0;
    const orderId = randomUUID();
    const now = new Date();

    const orderItemsPayload = dto.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.price);
      const subtotal = unitPrice * item.quantity;
      total += subtotal;

      return {
        id: randomUUID(),
        orderId,
        productId: item.productId,
        productName: product.name,
        unitPrice: String(unitPrice),
        quantity: String(item.quantity),
        subtotal: String(subtotal),
      };
    });

    const paymentId = randomUUID();

    const { order, payment } =
      await this.orderRepository.createOrderWithItemsAndPayment({
        order: {
          id: orderId,
          tenantId,
          cashierId,
          status: 'awaiting_payment',
          total: String(total),
          paymentMethod: dto.paymentMethod,
          customerEmail: dto.customerEmail ?? null,
          notes: null,
          confirmedAt: null,
          createdAt: now,
          updatedAt: now,
        },
        items: orderItemsPayload,
        payment: {
          id: paymentId,
          tenantId,
          orderId,
          method: dto.paymentMethod,
          amount: String(total),
          status: 'pending',
          externalId: null,
          pixQrCode: null,
          confirmedAt: null,
          createdAt: now,
        },
      });

    // Emit real-time events to all cashier terminals in the same tenant
    for (const item of dto.items) {
      const product = productMap.get(item.productId)!;
      const newStock = Math.max(0, Number(product.stock) - item.quantity);
      this.eventsGateway.emitStockUpdate(tenantId, {
        productId: item.productId,
        newStock,
        productName: product.name,
      });
    }

    this.eventsGateway.emitNewOrder(tenantId, {
      orderId,
      total,
      cashierName: '',
    });

    let pixQrCode: string | null = null;
    let pixQrCodeBase64: string | null = null;

    if (dto.paymentMethod === 'pix') {
      const pixResult = await this.paymentService.generatePixQrCode(
        order.id,
        Number(order.total),
        tenantId,
        dto.customerEmail,
      );
      pixQrCode = pixResult.pixQrCode;
      pixQrCodeBase64 = pixResult.pixQrCodeBase64;

      await this.orderRepository.updatePaymentPixData(
        payment.id,
        pixResult.pixQrCode,
        pixResult.pixQrCodeBase64,
        pixResult.externalId,
      );
    }

    return {
      orderId: order.id,
      total: Number(order.total),
      status: order.status,
      payment: {
        method: payment.method,
        pixQrCode,
        pixQrCodeBase64,
      },
    };
  }

  async findAll(
    tenantId: string | null,
    query: ListOrdersQueryDto,
  ): Promise<OrderListResponse> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);

    const { items, total } = await this.orderRepository.findAll(tenantId ?? null, page, limit, {
      status: query.status,
      cashierId: query.cashierId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });

    return {
      data: items.map(({ order, itemCount }) => ({
        id: order.id,
        tenantId: order.tenantId,
        cashierId: order.cashierId,
        status: order.status,
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        customerEmail: order.customerEmail,
        createdAt: order.createdAt,
        itemCount,
      })),
      meta: { page, total, limit },
    };
  }

  async findOne(
    id: string,
    tenantId: string,
  ): Promise<OrderResponseDto> {
    const result = await this.orderRepository.findById(id, tenantId);
    if (!result) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return this.mapToOrderResponseDto(result.order, result.items, result.payment);
  }

  async cancelOrder(
    orderId: string,
    requestingUserId: string,
    requestingRole: string,
    tenantId: string,
  ): Promise<{ id: string; status: string }> {
    const result = await this.orderRepository.findById(orderId, tenantId);
    if (!result) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const { order, items } = result;

    if (requestingRole === 'cashier') {
      if (order.cashierId !== requestingUserId) {
        throw new ForbiddenException('Cashiers can only cancel their own orders');
      }
      if (order.status !== 'pending') {
        throw new BadRequestException(
          'Cashiers can only cancel orders in pending status',
        );
      }
    } else {
      const cancellableStatuses = ['pending', 'awaiting_payment'];
      if (!cancellableStatuses.includes(order.status)) {
        throw new BadRequestException(
          `Cannot cancel order with status "${order.status}"`,
        );
      }
    }

    const tenant = await this.orderRepository.findTenantById(tenantId);
    const restoreStock = tenant?.stockEnabled === true;

    const productUnitTypes = restoreStock
      ? await this.orderRepository.findProductUnitTypes(items.map((i) => i.productId))
      : {};

    const updated = await this.orderRepository.cancelOrder(
      orderId,
      tenantId,
      restoreStock,
      items,
      productUnitTypes,
    );

    return { id: updated.id, status: updated.status };
  }

  async confirmCashOrder(
    orderId: string,
    tenantId: string,
  ): Promise<{ id: string; status: string }> {
    const result = await this.orderRepository.findById(orderId, tenantId);
    if (!result) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const { order, items, payment } = result;

    const cashMethods = ['cash', 'credit_card', 'debit_card'];
    if (!order.paymentMethod || !cashMethods.includes(order.paymentMethod)) {
      throw new BadRequestException(
        'confirm-cash is only valid for cash, credit_card, or debit_card orders',
      );
    }

    if (order.status !== 'awaiting_payment' && order.status !== 'pending') {
      throw new BadRequestException(
        `Cannot confirm order with current status "${order.status}"`,
      );
    }

    if (!payment) {
      throw new UnprocessableEntityException('Payment record not found for this order');
    }

    const tenant = await this.orderRepository.findTenantById(tenantId);
    const deductStock = tenant?.stockEnabled === true;

    const productUnitTypes = deductStock
      ? await this.orderRepository.findProductUnitTypes(items.map((i) => i.productId))
      : {};

    const updated = await this.orderRepository.confirmCashOrder(
      orderId,
      tenantId,
      payment.id,
      deductStock,
      items,
      productUnitTypes,
    );

    if (order.customerEmail) {
      const tenantResult = await this.dbService.db
        .select({ name: tenants.name })
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      const storeName = tenantResult[0]?.name ?? 'Loja';

      const receiptItems = items.map((item) => ({
        productName: item.productName,
        quantity: Number(item.quantity),
        subtotal: Number(item.subtotal),
      }));

      this.notificationService.sendReceiptEmail({
        customerEmail: order.customerEmail,
        storeName,
        orderId: order.id,
        items: receiptItems,
        total: Number(order.total),
        paymentMethod: order.paymentMethod ?? 'cash',
        confirmedAt: new Date(),
      });
    }

    return { id: updated.id, status: updated.status };
  }

  private mapToOrderResponseDto(
    order: {
      id: string;
      tenantId: string;
      cashierId: string;
      status: string;
      total: string;
      paymentMethod: string | null;
      customerEmail: string | null;
      notes: string | null;
      confirmedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    },
    items: OrderItem[],
    payment: Payment | null,
  ): OrderResponseDto {
    return {
      id: order.id,
      tenantId: order.tenantId,
      cashierId: order.cashierId,
      status: order.status,
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      customerEmail: order.customerEmail,
      notes: order.notes,
      confirmedAt: order.confirmedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: items.map(
        (item): OrderItemResponseDto => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          unitPrice: Number(item.unitPrice),
          quantity: Number(item.quantity),
          subtotal: Number(item.subtotal),
        }),
      ),
      payment: payment
        ? this.mapToPaymentResponseDto(payment)
        : null,
    };
  }

  private mapToPaymentResponseDto(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      method: payment.method,
      amount: Number(payment.amount),
      status: payment.status,
      pixQrCode: payment.pixQrCode,
      pixQrCodeBase64: null,
      externalId: payment.externalId,
      confirmedAt: payment.confirmedAt,
    };
  }
}
