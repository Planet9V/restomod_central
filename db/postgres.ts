// ⚠️ DEVELOPMENT ENVIRONMENT - PostgreSQL Configuration
// PostgreSQL database connection and configuration

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '@shared/schema';

// PostgreSQL configuration
export const POSTGRES_CONFIG = {
  // ⚠️ DEVELOPMENT CREDENTIALS - Load from environment variables
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'restomod_dev',
  user: process.env.POSTGRES_USER || 'restomod_user',
  password: process.env.POSTGRES_PASSWORD || 'DEV_PASSWORD_123',

  // SSL configuration
  ssl: process.env.POSTGRES_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,

  // Connection pool settings
  max: 20,                        // Maximum connections in pool
  idleTimeoutMillis: 30000,       // Close idle connections after 30s
  connectionTimeoutMillis: 2000,  // Timeout after 2s
};

// Create connection pool
export const pool = new Pool(POSTGRES_CONFIG);

// Create Drizzle database instance
export const postgresDb = drizzle(pool, { schema });

// Warn if using default development credentials
if (POSTGRES_CONFIG.password === 'DEV_PASSWORD_123') {
  console.warn('⚠️  WARNING: Using default development database password!');
  console.warn('   Set POSTGRES_PASSWORD environment variable for production.');
}

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    console.log('✅ PostgreSQL connection successful');
    console.log(`   Database: ${POSTGRES_CONFIG.database}`);
    console.log(`   Host: ${POSTGRES_CONFIG.host}:${POSTGRES_CONFIG.port}`);
    console.log(`   Time: ${result.rows[0].now}`);

    return true;
  } catch (error: any) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    console.error('   Make sure PostgreSQL is running and configured correctly');
    return false;
  }
}

// Graceful shutdown
export async function closeConnection(): Promise<void> {
  await pool.end();
  console.log('🔌 PostgreSQL connection pool closed');
}

// Health check
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  details: any;
}> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version(), now()');
    client.release();

    return {
      status: 'healthy',
      details: {
        version: result.rows[0].version,
        time: result.rows[0].now,
        connections: {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount
        }
      }
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      details: {
        error: error.message
      }
    };
  }
}

// Export connection status
export function getConnectionStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
    config: {
      host: POSTGRES_CONFIG.host,
      port: POSTGRES_CONFIG.port,
      database: POSTGRES_CONFIG.database,
      user: POSTGRES_CONFIG.user,
      maxConnections: POSTGRES_CONFIG.max
    }
  };
}

// Auto-test connection on import (optional)
if (process.env.NODE_ENV !== 'test') {
  testConnection().catch(console.error);
}
