import { exportAllProfilesToExcel } from "@/lib/exportExcel";
import fs from "fs";

export const runtime = "nodejs";

export async function GET() {
  try {
    const filePath = await exportAllProfilesToExcel();
    const fileBuffer = fs.readFileSync(filePath);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="kollab_profiles.csv"',
      },
    });
  } catch (err) {
    console.error("[Export] Error:", err);
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
