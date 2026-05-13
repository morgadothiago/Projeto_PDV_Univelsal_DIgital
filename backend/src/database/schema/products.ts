import { pgTable, text, boolean, timestamp, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenants';
import { categories } from './categories';
import { orderItems } from './order-items';
import { stockEntries } from './stock-entries';

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  categoryId: text('category_id'),
  name: text('name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  unitType: text('unit_type').notNull().default('unit'),
  stock: numeric('stock').notNull().default('0'),
  stockThreshold: numeric('stock_threshold').notNull().default('5'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
  stockEntries: many(stockEntries),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
