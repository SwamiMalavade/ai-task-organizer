import fs from "fs";
import path from "path";
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function migrate() {
  console.log("Starting database migration...");

  const client = new Client(
    process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : {
          host: process.env.DB_HOST || "localhost",
          port: parseInt(process.env.DB_PORT || "5432"),
          user: process.env.DB_USER || "postgres",
          password: process.env.DB_PASSWORD || "",
          database: process.env.DB_NAME || "task_organizer",
        }
  );

  try {
    await client.connect();
    console.log("✓ Connected to PostgreSQL database");

    const schemaPath = __dirname.includes("dist")
      ? path.join(__dirname, "..", "..", "src", "database", "schema.sql")
      : path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await client.query(schema);
    console.log("✓ Database migration completed successfully!");
  } catch (error) {
    console.error("✗ Migration failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

migrate().catch(console.error);
