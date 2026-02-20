import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:afX6TKPcNOahudET@db.afbcyivirvhcwdmdqyvz.supabase.co:5432/postgres';

const pool = new pg.Pool({
  connectionString,
  max: 10, // Reduced for serverless environments to avoid connection exhaustion
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : (connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : false)
});

// Error handling to prevent crashes in serverless functions
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
