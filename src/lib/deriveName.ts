/**
 * Derive a display name from Facebook or Instagram handle.
 * Extracts username from URL or handle, then formats it nicely.
 */
export function deriveName(facebook: string, instagram: string): string | null {
  // Try Facebook first
  if (facebook) {
    const fbName = extractFbName(facebook);
    if (fbName) return formatName(fbName);
  }

  // Fall back to Instagram
  if (instagram) {
    const igName = instagram.replace(/^@/, "").trim();
    if (igName) return formatName(igName);
  }

  return null;
}

function extractFbName(input: string): string | null {
  // Handle full URL: https://facebook.com/username or https://fb.com/username
  const urlMatch = input.match(
    /(?:facebook\.com|fb\.com)\/(?:profile\.php\?id=)?([^/?&]+)/i
  );
  if (urlMatch) return urlMatch[1];

  // Handle plain username/handle
  const trimmed = input.trim();
  if (trimmed && !trimmed.includes(" ")) return trimmed;

  return null;
}

function formatName(handle: string): string {
  // Convert underscores and dots to spaces, then title-case
  return handle
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
