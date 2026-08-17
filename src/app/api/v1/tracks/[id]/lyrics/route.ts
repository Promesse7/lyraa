import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { LANGUAGES, type Language } from "@/lib/constants";
import { applyRateLimit, corsPreflight } from "@/lib/api";

export async function OPTIONS() {
  return corsPreflight();
}

/**
 * GET /api/v1/tracks/{id}/lyrics?lang=rw|en|fr — id or slug accepted.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/v1/tracks/[id]/lyrics">
) {
  const rate = await applyRateLimit(request);
  if (rate.blocked) return rate.blocked;

  const { id } = await params;
  const lang = (new URL(request.url).searchParams.get("lang") ??
    "rw") as Language;
  if (!LANGUAGES.includes(lang)) {
    return NextResponse.json(
      { error: "invalid_lang", allowed: LANGUAGES },
      { status: 400, headers: rate.headers }
    );
  }

  const track = await db.track.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      artist: { select: { name: true, slug: true } },
      sections: {
        orderBy: { order: "asc" },
        include: { lines: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!track) {
    return NextResponse.json(
      { error: "track_not_found" },
      { status: 404, headers: rate.headers }
    );
  }

  const pick = (line: { textRw: string; textEn: string | null; textFr: string | null }) =>
    lang === "en" ? line.textEn : lang === "fr" ? line.textFr : line.textRw;

  return NextResponse.json(
    {
      data: {
        id: track.id,
        slug: track.slug,
        title: track.title,
        artist: track.artist,
        verification: track.verification,
        lang,
        sections: track.sections.map((section) => ({
          label: section.label,
          lines: section.lines.map((line) => ({
            order: line.order,
            text: pick(line),
            original: lang === "rw" ? undefined : line.textRw,
          })),
        })),
      },
    },
    { headers: rate.headers }
  );
}
