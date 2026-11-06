// Applies db/schema.sql. Usage: node --env-file=.env.local db/migrate.mjs
import { readFileSync } from "node:fs";
import { Pool } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing");
const pool = new Pool({ connectionString: url });
await pool.query(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
await pool.end();
console.log("schema applied");
