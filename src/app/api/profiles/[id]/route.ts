import { NextRequest } from "next/server";
import { db, ensureTable, Profile } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureTable();
  const { id } = await params;
  const result = await db.execute({ sql: "SELECT * FROM Profile WHERE id = ?", args: [id] });
  const profile = result.rows[0] as unknown as Profile | undefined;

  if (!profile) {
    return Response.json({ error: "Không tìm thấy hồ sơ." }, { status: 404 });
  }

  return Response.json(profile);
}
