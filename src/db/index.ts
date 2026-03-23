/**
 * 数据库入口
 * 使用 PostgreSQL (通过 Drizzle ORM)
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// 检查数据库URL
if (!process.env.DATABASE_URL) {
  console.warn('[DB] Warning: DATABASE_URL not set. Using mock database for development.');
}

// 创建数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:localdev@localhost:5432/ziru_assistant',
});

// 创建 Drizzle 实例
export const db = drizzle(pool, { schema });

// 导出 schema
export * from './schema';
