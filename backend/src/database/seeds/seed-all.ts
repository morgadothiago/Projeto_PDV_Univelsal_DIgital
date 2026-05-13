import 'reflect-metadata';
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import * as schema from '../schema';

const TENANT_ID = 'tenant-loja-demo-001';

const USERS = [
  {
    email: 'admin@pdvuniversal.com',
    password: 'Admin@123',
    name: 'Super Admin',
    role: 'super_admin' as const,
    tenantId: null,
  },
  {
    email: 'owner@lojademo.com',
    password: 'Owner@123',
    name: 'Dono da Loja',
    role: 'store_owner' as const,
    tenantId: TENANT_ID,
  },
  {
    email: 'caixa@lojademo.com',
    password: 'Caixa@123',
    name: 'Operador de Caixa',
    role: 'cashier' as const,
    tenantId: TENANT_ID,
  },
];

async function seedAll(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) throw new Error('DATABASE_URL não definida no .env');

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });
  const now = new Date();

  // Cria tenant demo
  const existingTenant = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.id, TENANT_ID))
    .limit(1);

  if (existingTenant.length === 0) {
    await db.insert(schema.tenants).values({
      id: TENANT_ID,
      name: 'Loja Demo',
      type: 'retail',
      plan: 'free',
      stockEnabled: true,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log('✓ Tenant criado: Loja Demo');
  } else {
    console.log('→ Tenant já existe, pulando.');
  }

  // Cria usuários
  for (const user of USERS) {
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, user.email))
      .limit(1);

    if (existing.length > 0) {
      console.log(`→ Usuário já existe: ${user.email}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 12);
    await db.insert(schema.users).values({
      id: randomUUID(),
      tenantId: user.tenantId,
      email: user.email,
      passwordHash,
      name: user.name,
      role: user.role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`✓ Criado [${user.role}]: ${user.email} / senha: ${user.password}`);
  }

  console.log('\n=== SEED COMPLETO ===');
  console.log('Acesse: http://localhost:3000/api/docs');
  console.log('\nCredenciais:');
  for (const u of USERS) {
    console.log(`  [${u.role.padEnd(12)}] ${u.email}  |  ${u.password}`);
  }
  process.exit(0);
}

seedAll().catch((err: unknown) => {
  console.error('Seed falhou:', err);
  process.exit(1);
});
