import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { GENRES } from "@/lib/constants";
import { applyRateLimit, corsPreflight } from "@/lib/api";

export async function OPTIONS() {
  return corsPreflight();
}

/**
 * GET /api/v1/tracks — search & filter tracks (spec §6).
 * Query params: q (title/artist search), genre, artist (slug),
 * limit (<=50), offset.
 */
export async function GET(request: NextRequest) {
  const rate = await applyRateLimit(request);
  if (rate.blocked) return rate.blocked;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const genre = searchParams.get("genre")?.trim();
  const artistSlug = searchParams.get("artist")?.trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? 20) || 20, 50);
  const offset = Math.max(Number(searchParams.get("offset") ?? 0) || 0, 0);

  if (genre && !(GENRES as readonly string[]).includes(genre)) {
    return NextResponse.json(
      { error: "invalid_genre", allowed: GENRES },
      { status: 400, headers: rate.headers }
    );
  }

  const tracks = await db.track.findMany({
    where: {
      ...(genre ? { genre } : {}),
      ...(artistSlug ? { artist: { slug: artistSlug } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { artist: { name: { contains: q } } },
            ],
          }
        : {}),
    },
    orderBy: { trendingScore: "desc" },
    skip: offset,
    take: limit,
    include: {
      artist: { select: { name: true, slug: true, verified: true } },
      _count: { select: { annotations: true, lines: true } },
    },
  });

  return NextResponse.json(
    {
      data: tracks.map((track) => ({
        id: track.id,
        slug: track.slug,
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        releaseYear: track.releaseYear,
        verification: track.verification,
        annotationCount: track._count.annotations,
        lineCount: track._count.lines,
      })),
      meta: { limit, offset, count: tracks.length },
    },
    { headers: rate.headers }
  );
}
