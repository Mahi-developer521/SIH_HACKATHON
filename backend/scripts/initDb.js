const fs = require('fs');
const path = require('path');
const { pool } = require('../db');

async function initializeDatabase() {
  console.log('Connecting to PostgreSQL database...');

  try {
    const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
    const seedPath = path.join(__dirname, '..', 'sql', 'seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('Applying database schema (11+ tables)...');
    await pool.query(schemaSql);
    console.log('Schema applied successfully.');

    console.log('Inserting baseline demonstration seed data...');
    await pool.query(seedSql);
    console.log('Seed data applied successfully.');

    console.log('Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  }
}

initializeDatabase();
