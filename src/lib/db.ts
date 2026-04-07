import Database from "better-sqlite3";
import path from "path";

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

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
export const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Create table if not exists
db.exec(`
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
