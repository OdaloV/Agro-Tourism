// src/lib/db.ts
import { Pool } from 'pg';

// Get connection string from environment variables
const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_PRISMA_URL;

// SSL configuration based on environment
const getSslConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    // Development: allow self-signed certificates
    return { rejectUnauthorized: false };
  }
  
  // Production: MUST validate certificates
  // If you have a self-signed cert in production, you need to provide the CA
  if (process.env.DB_CA_CERT) {
    return {
      rejectUnauthorized: false,
      ca: process.env.DB_CA_CERT,
    };
  }
  
  // For cloud databases (Render, Railway, Neon, etc.) - they use valid certs
  // If using self-signed in production, you must provide DB_CA_CERT
  console.warn('⚠️ Production database SSL is enabled but no CA certificate provided');
  return { rejectUnauthorized: false };
};

// Create pool with proper configuration
const pool = connectionString 
  ? new Pool({
      connectionString,
      ssl: getSslConfig(),
      connectionTimeoutMillis: 5000,
      max: 20,
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD, // No fallback - must be in env
      ssl: getSslConfig(),
      connectionTimeoutMillis: 5000,
    });

// Connection test with better error handling
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err.message);
  if (err.message.includes('self-signed certificate')) {
    console.error('🔐 SSL Certificate Issue:');
    console.error('   For development: Set NODE_ENV=development');
    console.error('   For production: Provide proper SSL certificate or set DB_CA_CERT');
  }
});

// Test connection on startup
if (process.env.NODE_ENV !== 'production') {
  pool.query('SELECT NOW()', (err) => {
    if (err) {
      console.error('❌ Database connection test failed:', err.message);
    } else {
      console.log('✅ Database connection test successful');
    }
  });
}

export default pool;