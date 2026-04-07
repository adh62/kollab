import { NextRequest } from "next/server";
import { db, Profile } from "@/lib/db";
import { deriveName } from "@/lib/deriveName";
import { scrapeProfile } from "@/lib/apify";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
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

  const profiles = db.prepare(query).all(...params) as Profile[];
  return Response.json(profiles);
}

export async function POST(request: NextRequest) {
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

  // Derive fallback name from username/handle
  const fallbackName = deriveName(fb, ig);
  if (!fallbackName) {
    return Response.json({ error: "Không thể lấy tên hiển thị. Vui lòng kiểm tra Facebook hoặc Instagram." }, { status: 400 });
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const attrList = Array.isArray(attributes) ? attributes.filter((a: string) => a.trim()).join(",") : null;

  // Insert profile immediately with fallback name (fast response)
  db.prepare(`
    INSERT INTO Profile (id, name, profession, city, email, phone, facebook, instagram, bio, photoUrl, attributes, priceTier, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
    now
  );

  // Scrape profile data from Apify in background (don't block response)
  scrapeProfile(ig, fb).then((scraped) => {
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
      db.prepare(`UPDATE Profile SET ${updates.join(", ")} WHERE id = ?`).run(...values);
      console.log(`[Apify] Updated profile ${id}: photo=${!!scraped.photoUrl}, name=${!!scraped.realName}, bio=${!!scraped.bio}`);
    }
  }).catch((e) => {
    console.error(`[Apify] Background scrape failed for ${id}:`, e);
  });

  const profile = db.prepare("SELECT * FROM Profile WHERE id = ?").get(id) as Profile;
  return Response.json(profile, { status: 201 });
}
