-- Make cashier_id nullable to support self-service menu orders (no cashier session)
ALTER TABLE "orders" ALTER COLUMN "cashier_id" DROP NOT NULL;
--> statement-breakpoint

-- Add source column to distinguish POS vs cardápio digital orders
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "source" text NOT NULL DEFAULT 'pos';
--> statement-breakpoint

-- Add self-service customer info columns
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_name" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_phone" text;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "table_ref" text;
