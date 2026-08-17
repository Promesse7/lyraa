/**
 * Parse a raw lyric submission body into sections + lines.
 * Section markers are bracketed lines — "[Verse 1]", "[Chorus]" — per the
 * submit form's guidance (design screen 09). Lines before any marker fall
 * into an implicit "Verse 1".
 */
export type ParsedSection = { label: string; lines: string[] };

export function parseSubmissionBody(body: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const marker = /^\[(.+)\]$/.exec(line);
    if (marker) {
      current = { label: marker[1].trim(), lines: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { label: "Verse 1", lines: [] };
      sections.push(current);
    }
    current.lines.push(line);
  }

  return sections.filter((s) => s.lines.length > 0);
}

/** URL slug from a title — used when approving a submission into a track. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
