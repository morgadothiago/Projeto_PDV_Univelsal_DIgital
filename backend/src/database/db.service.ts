import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

@Injectable()
export class DbService implements OnModuleInit {
  private _db!: NeonHttpDatabase<typeof schema>;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const sql = neon(databaseUrl);
    this._db = drizzle(sql, { schema });
  }

  get db(): NeonHttpDatabase<typeof schema> {
    return this._db;
  }
}
