import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:afX6TKPcNOahudET@db.afbcyivirvhcwdmdqyvz.supabase.co:5432/postgres';

const pool = new pg.Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
