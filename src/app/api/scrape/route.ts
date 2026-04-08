import { NextRequest } from "next/server";
import { db, ensureTable, Profile } from "@/lib/db";
import { scrapeProfile } from "@/lib/apify";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

/**
 * POST /api/scrape — enrich profiles that don't have a photoUrl yet.
 * Pass ?limit=N to control how many profiles to scrape (default 5).
 * Pass ?names=name1,name2 to scrape specific profiles.
 */
export async function POST(request: NextRequest) {
  await ensureTable();
  const { searchParams } = request.nextUrl;
  const limit = parseInt(searchParams.get("limit") || "5", 10);
  const namesParam = searchParams.get("names") || "";

  let profiles: Profile[];

  if (namesParam) {
    const names = namesParam.split(",").map((n) => n.trim());
    const placeholders = names.map(() => "?").join(",");
    const result = await db.execute({
      sql: `SELECT * FROM Profile WHERE name IN (${placeholders})`,
      args: names,
    });
    profiles = result.rows as unknown as Profile[];
  } else {
    const result = await db.execute({
      sql: "SELECT * FROM Profile WHERE photoUrl IS NULL LIMIT ?",
      args: [limit],
    });
    profiles = result.rows as unknown as Profile[];
  }

  if (profiles.length === 0) {
    return Response.json({ message: "No profiles to scrape.", count: 0 });
  }

  const results: { name: string; status: string; photo?: boolean; realName?: string }[] = [];

  // Run sequentially to avoid overwhelming Apify
  for (const profile of profiles) {
    try {
      console.log(`[Scrape] Scraping ${profile.name} (ig:${profile.instagram}, fb:${profile.facebook})...`);
      const scraped = await scrapeProfile(profile.instagram || "", profile.facebook || "");

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
      if (scraped.bio && !profile.bio) {
        updates.push("bio = ?");
        values.push(scraped.bio);
      }

      if (updates.length > 0) {
        updates.push("updatedAt = ?");
        values.push(new Date().toISOString());
        values.push(profile.id);
        await db.execute({
          sql: `UPDATE Profile SET ${updates.join(", ")} WHERE id = ?`,
          args: values,
        });
        results.push({
          name: profile.name,
          status: "updated",
          photo: !!scraped.photoUrl,
          realName: scraped.realName || undefined,
        });
        console.log(`[Scrape] ✓ ${profile.name} → photo:${!!scraped.photoUrl}, name:${scraped.realName || "—"}`);
      } else {
        results.push({ name: profile.name, status: "no_data" });
        console.log(`[Scrape] ✗ ${profile.name} → no data returned`);
      }
    } catch (e) {
      results.push({ name: profile.name, status: `error: ${e}` });
      console.error(`[Scrape] ✗ ${profile.name} error:`, e);
    }
  }

  const updated = results.filter((r) => r.status === "updated").length;

  return Response.json({
    message: `Enriched ${updated} of ${profiles.length} profiles.`,
    updated,
    total: profiles.length,
    results,
  });
}
