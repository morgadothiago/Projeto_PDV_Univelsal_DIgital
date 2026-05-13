import 'reflect-metadata';
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import * as schema from '../schema';

async function seedAdmin(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const adminEmail = process.env['ADMIN_EMAIL'];
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL environment variable is not set');
  }

  const adminPassword = process.env['ADMIN_PASSWORD'];
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD environment variable is not set');
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, adminEmail))
    .limit(1);

  if (existing.length > 0) {
    console.log('Super admin already exists, skipping.');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const now = new Date();

  await db.insert(schema.users).values({
    id: randomUUID(),
    tenantId: null,
    email: adminEmail,
    passwordHash,
    name: 'Super Admin',
    role: 'super_admin',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`Super admin created: ${adminEmail}`);
  process.exit(0);
}

seedAdmin().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
