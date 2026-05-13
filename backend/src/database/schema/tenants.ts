import { pgTable, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { categories } from './categories';
import { products } from './products';
import { orders } from './orders';
import { payments } from './payments';
import { stockEntries } from './stock-entries';

export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  plan: text('plan').notNull().default('free'),
  stockEnabled: boolean('stock_enabled').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  categories: many(categories),
  products: many(products),
  orders: many(orders),
  payments: many(payments),
  stockEntries: many(stockEntries),
}));

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
