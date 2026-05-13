import { pgTable, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenants';
import { products } from './products';
import { users } from './users';

export const stockEntries = pgTable('stock_entries', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  productId: text('product_id').notNull(),
  quantity: numeric('quantity').notNull(),
  reason: text('reason'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const stockEntriesRelations = relations(stockEntries, ({ one }) => ({
  tenant: one(tenants, {
    fields: [stockEntries.tenantId],
    references: [tenants.id],
  }),
  product: one(products, {
    fields: [stockEntries.productId],
    references: [products.id],
  }),
  createdByUser: one(users, {
    fields: [stockEntries.createdBy],
    references: [users.id],
  }),
}));

export type StockEntry = typeof stockEntries.$inferSelect;
export type NewStockEntry = typeof stockEntries.$inferInsert;
