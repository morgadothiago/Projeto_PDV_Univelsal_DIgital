import { pgTable, text, boolean, timestamp, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenants';
import { orders } from './orders';
import { stockEntries } from './stock-entries';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id'),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  passwordResetToken: varchar('password_reset_token', { length: 64 }),
  passwordResetExpiresAt: timestamp('password_reset_expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  orders: many(orders),
  stockEntries: many(stockEntries),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
