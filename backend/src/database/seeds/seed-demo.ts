import 'reflect-metadata';
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import * as schema from '../schema';

const TENANT_ID = 'tenant-loja-demo-001';

const CATEGORIES = [
  { name: 'Bebidas quentes' },
  { name: 'Bebidas frias' },
  { name: 'Comida simples' },
  { name: 'Lanches' },
  { name: 'Sobremesas' },
];

const PRODUCTS = [
  { name: 'Café Expresso', price: '5.00', category: 'Bebidas quentes', stock: '150', threshold: '20' },
  { name: 'Cappuccino', price: '8.50', category: 'Bebidas quentes', stock: '80', threshold: '15' },
  { name: 'Chá Verde', price: '4.00', category: 'Bebidas quentes', stock: '60', threshold: '10' },
  { name: 'Suco de Laranja', price: '7.00', category: 'Bebidas frias', stock: '40', threshold: '10' },
  { name: 'Água Mineral', price: '3.00', category: 'Bebidas frias', stock: '200', threshold: '30' },
  { name: 'Refrigerante Lata', price: '5.50', category: 'Bebidas frias', stock: '100', threshold: '20' },
  { name: 'Pão de Queijo', price: '4.50', category: 'Comida simples', stock: '8', threshold: '15' },
  { name: 'Misto Quente', price: '9.00', category: 'Lanches', stock: '25', threshold: '10' },
  { name: 'Coxinha', price: '6.00', category: 'Lanches', stock: '30', threshold: '10' },
  { name: 'Bolo de Cenoura', price: '7.00', category: 'Sobremesas', stock: '2', threshold: '5' },
  { name: 'Pudim', price: '8.00', category: 'Sobremesas', stock: '15', threshold: '5' },
  { name: 'Brigadeiro', price: '3.50', category: 'Sobremesas', stock: '50', threshold: '10' },
];

async function seedDemo(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) throw new Error('DATABASE_URL não definida');

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema });
  const now = new Date();

  // Verifica tenant
  const tenant = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.id, TENANT_ID))
    .limit(1);

  if (tenant.length === 0) {
    console.error('Tenant não encontrado. Rode primeiro: npm run seed:all');
    process.exit(1);
  }

  // Cria categorias
  const categoryMap: Record<string, string> = {};

  for (const cat of CATEGORIES) {
    const existing = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.tenantId, TENANT_ID))
      .limit(100);

    const found = existing.find((c) => c.name === cat.name);
    if (found) {
      categoryMap[cat.name] = found.id;
      console.log(`→ Categoria já existe: ${cat.name}`);
      continue;
    }

    const id = randomUUID();
    await db.insert(schema.categories).values({
      id,
      tenantId: TENANT_ID,
      name: cat.name,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    categoryMap[cat.name] = id;
    console.log(`✓ Categoria criada: ${cat.name}`);
  }

  // Cria produtos
  for (const prod of PRODUCTS) {
    const existing = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.tenantId, TENANT_ID))
      .limit(100);

    const found = existing.find((p) => p.name === prod.name);
    if (found) {
      console.log(`→ Produto já existe: ${prod.name}`);
      continue;
    }

    await db.insert(schema.products).values({
      id: randomUUID(),
      tenantId: TENANT_ID,
      categoryId: categoryMap[prod.category] ?? null,
      name: prod.name,
      price: prod.price,
      unitType: 'unit',
      stock: prod.stock,
      stockThreshold: prod.threshold,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`✓ Produto criado: ${prod.name} (R$ ${prod.price})`);
  }

  console.log('\n=== SEED DEMO COMPLETO ===');
  console.log(`${CATEGORIES.length} categorias | ${PRODUCTS.length} produtos`);
  console.log('Agora o PDV e Estoque têm dados para testar.');
  process.exit(0);
}

seedDemo().catch((err) => {
  console.error('Seed demo falhou:', err);
  process.exit(1);
});
