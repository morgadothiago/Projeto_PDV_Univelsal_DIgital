import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';

const logger = new Logger('Bootstrap');

async function runMigrations(): Promise<void> {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    logger.warn('DATABASE_URL not set — skipping migrations');
    return;
  }
  try {
    const sql = neon(databaseUrl);
    const db = drizzle(sql);
    await migrate(db, { migrationsFolder: join(__dirname, '..', 'src', 'database', 'migrations') });
    logger.log('Database migrations applied successfully');
  } catch (err) {
    logger.error('Migration failed — aborting startup', err);
    process.exit(1);
  }
}

async function bootstrap(): Promise<void> {
  await runMigrations();

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('PDV Universal API')
    .setDescription('Multi-tenant POS system API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.enableCors({
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
  });

  // Health check — used by Fly.io TCP/HTTP checks
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/api/v1/health', (_req: unknown, res: { json: (body: unknown) => void }) => {
    res.json({ status: 'ok' });
  });

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`PDV Universal Backend running on port ${port}`);
}

void bootstrap();
