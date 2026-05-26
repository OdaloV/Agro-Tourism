import { Pool } from 'pg';

// Get connection string from environment variables
const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_PRISMA_URL;

// If no connection string, use individual params (fallback for local development)
const pool = connectionString 
  ? new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'harvesthostdb',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'kokomelon2025',
    });

if (process.env.NODE_ENV !== 'production') {
  console.log(`Database config: ${connectionString ? 'Using connection string' : 'Using individual params'}`);
}

export default pool;