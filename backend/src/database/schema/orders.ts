import { pgTable, text, boolean, timestamp, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenants';
import { users } from './users';
import { orderItems } from './order-items';
import { payments } from './payments';

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  cashierId: text('cashier_id').notNull(),
  status: text('status').notNull().default('pending'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method'),
  customerEmail: text('customer_email'),
  notes: text('notes'),
  confirmedAt: timestamp('confirmed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [orders.tenantId],
    references: [tenants.id],
  }),
  cashier: one(users, {
    fields: [orders.cashierId],
    references: [users.id],
  }),
  items: many(orderItems),
  payments: many(payments),
}));

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
