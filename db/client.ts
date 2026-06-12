import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/db/schema";

let cachedDb: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!cachedDb) {
    const dbPath = join(process.cwd(), "db", "baojai.sqlite");
    mkdirSync(dirname(dbPath), { recursive: true });

    const sqlite = new Database(dbPath);
    sqlite.pragma("foreign_keys = ON");
    cachedDb = drizzle(sqlite, { schema });
  }

  return cachedDb;
}
