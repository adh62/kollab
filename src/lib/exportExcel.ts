import { db, ensureTable, type Profile } from "./db";
import fs from "fs";
import path from "path";

const EXPORT_PATH = path.join(process.cwd(), "exports");
const EXCEL_FILE = path.join(EXPORT_PATH, "kollab_profiles.csv");

function escapeCSV(value: string | null): string {
  if (!value) return "";
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportAllProfilesToExcel(): Promise<string> {
  await ensureTable();

  // Ensure exports directory exists
  if (!fs.existsSync(EXPORT_PATH)) {
    fs.mkdirSync(EXPORT_PATH, { recursive: true });
  }

  const result = await db.execute("SELECT * FROM Profile ORDER BY createdAt DESC");
  const profiles = result.rows as unknown as Profile[];

  const headers = [
    "ID", "Name", "Profession", "City", "Email", "Phone",
    "Facebook", "Instagram", "Bio", "Photo URL",
    "Attributes", "Price Tier", "Created At", "Updated At",
  ];

  const rows = profiles.map((p) => [
    escapeCSV(p.id),
    escapeCSV(p.name),
    escapeCSV(p.profession),
    escapeCSV(p.city),
    escapeCSV(p.email),
    escapeCSV(p.phone),
    escapeCSV(p.facebook),
    escapeCSV(p.instagram),
    escapeCSV(p.bio),
    escapeCSV(p.photoUrl),
    escapeCSV(p.attributes),
    escapeCSV(p.priceTier),
    escapeCSV(p.createdAt),
    escapeCSV(p.updatedAt),
  ].join(","));

  // BOM for Excel UTF-8 compatibility
  const bom = "\uFEFF";
  const csv = bom + headers.join(",") + "\n" + rows.join("\n") + "\n";

  fs.writeFileSync(EXCEL_FILE, csv, "utf-8");
  console.log(`[Export] Exported ${profiles.length} profiles to ${EXCEL_FILE}`);

  return EXCEL_FILE;
}

export function getExportPath(): string {
  return EXCEL_FILE;
}
