import { neon } from "@neondatabase/serverless";

/** Tagged-template SQL over HTTP. Every app query must filter by workspace_id. */
export const sql = neon(process.env.DATABASE_URL ?? "postgres://missing");
