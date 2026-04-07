import { NextRequest } from "next/server";
import { db, Profile } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profile = db.prepare("SELECT * FROM Profile WHERE id = ?").get(id) as Profile | undefined;

  if (!profile) {
    return Response.json({ error: "Không tìm thấy hồ sơ." }, { status: 404 });
  }

  return Response.json(profile);
}
