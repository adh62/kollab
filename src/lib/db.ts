import { createClient } from "@libsql/client";

export interface Profile {
  id: string;
  name: string;
  profession: string;
  city: string;
  email: string;
  phone: string | null;
  facebook: string | null;
  instagram: string | null;
  bio: string | null;
  photoUrl: string | null;
  attributes: string | null;
  priceTier: string | null;
  createdAt: string;
  updatedAt: string;
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Ensure table exists on first use
let initialized = false;
async function ensureTable() {
  if (initialized) return;
  await db.execute(`
    CREATE TABLE IF NOT EXISTS Profile (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      profession TEXT NOT NULL,
      city TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      facebook TEXT,
      instagram TEXT,
      bio TEXT,
      photoUrl TEXT,
      attributes TEXT,
      priceTier TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  initialized = true;
}

export { db, ensureTable };
