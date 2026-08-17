import { db } from "./db";
import { GENRES, type Genre } from "./constants";

/** Trending tracks for Discover (screen 02), optionally filtered by genre. */
export async function getTrendingTracks(genre?: string, take = 8) {
  const where =
    genre && (GENRES as readonly string[]).includes(genre)
      ? { genre: genre as Genre }
      : {};
  return db.track.findMany({
    where,
    orderBy: { trendingScore: "desc" },
    take,
    include: { artist: { select: { name: true, slug: true, verified: true } } },
  });
}

/**
 * "Lyric of the day" (screen 02 hero): deterministic daily pick — the
 * most-liked line of the track chosen by day-of-year, so it rotates daily
 * without a cron.
 */
export async function getLyricOfTheDay() {
  const tracks = await db.track.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (tracks.length === 0) return null;
  const day = Math.floor(Date.now() / 86_400_000);
  const track = tracks[day % tracks.length];
  const line = await db.lyricLine.findFirst({
    where: { trackId: track.id },
    orderBy: { likesCount: "desc" },
    include: {
      track: {
        include: { artist: { select: { name: true, slug: true } } },
      },
    },
  });
  return line;
}

/** Full-text-ish search across titles, artists, genres and verse lines (screen 03). */
export async function searchAll(q: string) {
  const query = q.trim();
  if (query.length < 2) return { tracks: [], verseMatches: [] };

  const [tracks, verseMatches] = await Promise.all([
    db.track.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { artist: { name: { contains: query } } },
          { genre: { contains: query } },
        ],
      },
      orderBy: { trendingScore: "desc" },
      take: 10,
      include: {
        artist: { select: { name: true, slug: true, verified: true } },
      },
    }),
    db.lyricLine.findMany({
      where: {
        OR: [
          { textRw: { contains: query } },
          { textEn: { contains: query } },
          { textFr: { contains: query } },
        ],
      },
      orderBy: { likesCount: "desc" },
      take: 5,
      include: {
        section: { select: { label: true } },
        track: {
          include: { artist: { select: { name: true, slug: true } } },
        },
      },
    }),
  ]);

  // don't repeat a verse match whose track already appears as a title hit
  const trackIds = new Set(tracks.map((t) => t.id));
  return {
    tracks,
    verseMatches: verseMatches.filter((l) => !trackIds.has(l.trackId)).slice(0, 3),
  };
}

/** The reader payload (screens 04–05): sections, lines, approved annotations. */
export async function getTrackForReader(slug: string) {
  return db.track.findUnique({
    where: { slug },
    include: {
      artist: { select: { id: true, name: true, slug: true, verified: true } },
      sections: {
        orderBy: { order: "asc" },
        include: {
          lines: {
            orderBy: { order: "asc" },
            include: {
              annotations: { where: { status: "APPROVED" } },
              _count: { select: { comments: true } },
            },
          },
        },
      },
    },
  });
}

/** Artist profile payload (screen 08). */
export async function getArtistProfile(slug: string) {
  const artist = await db.artist.findUnique({
    where: { slug },
    include: {
      tracks: {
        orderBy: { releaseYear: "desc" },
        include: { _count: { select: { annotations: true } } },
      },
    },
  });
  if (!artist) return null;
  const artistNotes = await db.annotation.count({
    where: {
      track: { artistId: artist.id },
      artistNote: { not: null },
    },
  });
  return { artist, artistNotes };
}

/** Feed payload (screen 07). */
export async function getFeed(sort: "foryou" | "latest") {
  return db.lyricCard.findMany({
    orderBy:
      sort === "latest"
        ? { createdAt: "desc" }
        : [{ likesCount: "desc" }, { createdAt: "desc" }],
    take: 20,
    include: {
      user: {
        select: { username: true, name: true, avatarTone: true, role: true },
      },
      track: {
        select: {
          slug: true,
          title: true,
          artist: { select: { name: true, verified: true } },
        },
      },
    },
  });
}

/** Compact "time ago" for feed timestamps. */
export function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h`;
  const d = Math.floor(m / 1440);
  if (d < 7) return `${d}d`;
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

/** 12.4k-style compact counts (design shows "1.2k", "18.4k"). */
export function compact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000)
    return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}
