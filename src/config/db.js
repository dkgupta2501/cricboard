const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    require: true,
    rejectUnauthorized: false // This is needed for Supabase
  }
});

// Test the connection
pool
  .query('SELECT NOW()')
  .then(res => {
    console.log('✅ PostgreSQL connected:', res.rows[0]);
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection error:', err.message);
  });

module.exports = pool;
