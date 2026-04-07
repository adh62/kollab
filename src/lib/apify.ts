/**
 * Scrape profile data from social media via Apify.
 * Returns photo URL, real name, and bio if available.
 *
 * NOTE: This is a stub implementation. To enable real scraping,
 * set APIFY_TOKEN in your .env and implement the actor calls.
 */

interface ScrapedProfile {
  photoUrl: string | null;
  realName: string | null;
  bio: string | null;
}

export async function scrapeProfile(
  instagram: string,
  facebook: string
): Promise<ScrapedProfile> {
  const token = process.env.APIFY_TOKEN;

  if (!token) {
    console.log("[Apify] No APIFY_TOKEN set, skipping scrape.");
    return { photoUrl: null, realName: null, bio: null };
  }

  try {
    if (instagram) {
      return await scrapeInstagram(instagram, token);
    }
    if (facebook) {
      return await scrapeFacebook(facebook, token);
    }
  } catch (err) {
    console.error("[Apify] Scrape error:", err);
  }

  return { photoUrl: null, realName: null, bio: null };
}

async function scrapeInstagram(
  username: string,
  token: string
): Promise<ScrapedProfile> {
  const res = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usernames: [username],
        resultsLimit: 1,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Apify Instagram returned ${res.status}`);
  }

  const data = await res.json();
  const profile = data?.[0];

  return {
    photoUrl: profile?.profilePicUrlHD || profile?.profilePicUrl || null,
    realName: profile?.fullName || null,
    bio: profile?.biography || null,
  };
}

async function scrapeFacebook(
  handle: string,
  token: string
): Promise<ScrapedProfile> {
  const res = await fetch(
    `https://api.apify.com/v2/acts/apify~facebook-profile-scraper/run-sync-get-dataset-items?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startUrls: [{ url: `https://www.facebook.com/${handle}` }],
        resultsLimit: 1,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Apify Facebook returned ${res.status}`);
  }

  const data = await res.json();
  const profile = data?.[0];

  return {
    photoUrl: profile?.profilePicture || null,
    realName: profile?.name || null,
    bio: profile?.about || null,
  };
}
