import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  console.log('Starting database migration...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    const schemaPath = __dirname.includes('dist') 
      ? path.join(__dirname, '..', '..', 'src', 'database', 'schema.sql')
      : path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await connection.query(schema);
    console.log('✓ Database migration completed successfully!');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

migrate().catch(console.error);
