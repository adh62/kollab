import { NextRequest } from "next/server";
import { db, ensureTable, Profile } from "@/lib/db";
import { deriveName } from "@/lib/deriveName";
import { scrapeProfile } from "@/lib/apify";
import { exportAllProfilesToExcel } from "@/lib/exportExcel";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  await ensureTable();
  const { searchParams } = request.nextUrl;
  const city = searchParams.get("city")?.trim() || "";
  const profession = searchParams.get("profession")?.trim() || "";

  let query = "SELECT * FROM Profile WHERE 1=1";
  const params: string[] = [];

  if (city) {
    query += " AND city = ?";
    params.push(city);
  }
  if (profession) {
    query += " AND profession LIKE ? COLLATE NOCASE";
    params.push(`%${profession}%`);
  }

  query += " ORDER BY createdAt DESC";

  const result = await db.execute({ sql: query, args: params });
  return Response.json(result.rows as unknown as Profile[]);
}

export async function POST(request: NextRequest) {
  await ensureTable();
  const body = await request.json();
  const { city, professions, email, phone, facebook, instagram, attributes, priceTier } = body;

  const fb = facebook?.trim() || "";
  const ig = instagram?.trim().replace(/^@/, "") || "";

  if (!city?.trim()) {
    return Response.json({ error: "Vui lòng chọn thành phố." }, { status: 400 });
  }
  if (!Array.isArray(professions) || professions.length === 0) {
    return Response.json({ error: "Vui lòng chọn ít nhất một nghề nghiệp." }, { status: 400 });
  }
  if (!email?.trim()) {
    return Response.json({ error: "Vui lòng nhập email." }, { status: 400 });
  }
  if (!fb && !ig) {
    return Response.json({ error: "Vui lòng nhập Facebook hoặc Instagram." }, { status: 400 });
  }

  const fallbackName = deriveName(fb, ig);
  if (!fallbackName) {
    return Response.json({ error: "Không thể lấy tên hiển thị. Vui lòng kiểm tra Facebook hoặc Instagram." }, { status: 400 });
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const attrList = Array.isArray(attributes) ? attributes.filter((a: string) => a.trim()).join(",") : null;

  await db.execute({
    sql: `INSERT INTO Profile (id, name, profession, city, email, phone, facebook, instagram, bio, photoUrl, attributes, priceTier, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      fallbackName,
      professions.join(","),
      city.trim(),
      email.trim().toLowerCase(),
      phone?.trim() || null,
      fb || null,
      ig || null,
      null,
      null,
      attrList,
      priceTier || null,
      now,
      now,
    ],
  });

  // Scrape profile data from Apify in background
  scrapeProfile(ig, fb).then(async (scraped) => {
    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (scraped.photoUrl) {
      updates.push("photoUrl = ?");
      values.push(scraped.photoUrl);
    }
    if (scraped.realName) {
      updates.push("name = ?");
      values.push(scraped.realName);
    }
    if (scraped.bio) {
      updates.push("bio = ?");
      values.push(scraped.bio);
    }

    if (updates.length > 0) {
      updates.push("updatedAt = ?");
      values.push(new Date().toISOString());
      values.push(id);
      await db.execute({
        sql: `UPDATE Profile SET ${updates.join(", ")} WHERE id = ?`,
        args: values,
      });
      console.log(`[Apify] Updated profile ${id}: photo=${!!scraped.photoUrl}, name=${!!scraped.realName}, bio=${!!scraped.bio}`);
    }
  }).catch((e) => {
    console.error(`[Apify] Background scrape failed for ${id}:`, e);
  });

  // Auto-export all profiles to Excel/CSV after each new signup
  try {
    await exportAllProfilesToExcel();
  } catch (e) {
    console.error("[Export] Auto-export failed:", e);
  }

  const result = await db.execute({ sql: "SELECT * FROM Profile WHERE id = ?", args: [id] });
  const profile = result.rows[0] as unknown as Profile;
  return Response.json(profile, { status: 201 });
}
