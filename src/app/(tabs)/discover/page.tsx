import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { GENRES } from "@/lib/constants";
import { getLyricOfTheDay, getTrendingTracks } from "@/lib/queries";
import {
  Avatar,
  Chip,
  Eyebrow,
  TrackRow,
  VerificationBadge,
} from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Discover" };

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function DiscoverPage({
  searchParams,
}: PageProps<"/discover">) {
  const { genre } = await searchParams;
  const activeGenre = typeof genre === "string" ? genre : undefined;
  const [session, lyricOfDay, trending] = await Promise.all([
    auth(),
    getLyricOfTheDay(),
    getTrendingTracks(activeGenre),
  ]);
  const user = session?.user;

  return (
    <main className="flex flex-1 flex-col pb-4">
      {/* header */}
      <div className="flex items-center justify-between px-[22px] pt-14">
        <div>
          <div className="text-[13px] text-neutral-600">Mwaramutse 👋</div>
          <h2 className="text-[26px]">Discover</h2>
        </div>
        <Link href={user ? "/profile" : "/login"} aria-label="Profile">
          <Avatar
            initials={user?.name ? initials(user.name) : "?"}
            size={44}
            tone={(user?.avatarTone as "sage" | "accent" | "neutral") ?? "sage"}
          />
        </Link>
      </div>

      {/* genre chips */}
      <div className="no-scrollbar mt-3.5 flex gap-2 overflow-x-auto px-[22px]">
        <Chip href="/discover" active={!activeGenre}>
          All
        </Chip>
        {GENRES.map((genreName) => (
          <Chip
            key={genreName}
            href={`/discover?genre=${encodeURIComponent(genreName)}`}
            active={activeGenre === genreName}
          >
            {genreName}
          </Chip>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-4 px-[22px] pt-4">
        {/* lyric of the day hero */}
        {lyricOfDay && (
          <Link
            href={`/track/${lyricOfDay.track.slug}` as never}
            className="relative overflow-hidden rounded-[28px] bg-sage-800 p-5 text-white"
          >
            <div
              aria-hidden
              className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-sage-700"
            />
            <div className="relative">
              <span className="inline-flex h-6 items-center gap-[5px] rounded-full bg-accent px-2.5 text-[11px] font-bold tracking-[0.05em] uppercase">
                Lyric of the day
              </span>
              <div className="my-2.5 font-heading text-[21px] leading-[1.3]">
                &ldquo;{lyricOfDay.textRw}&rdquo;
              </div>
              <div className="text-[13px] text-sage-200">
                {lyricOfDay.track.title} — {lyricOfDay.track.artist.name}
              </div>
            </div>
          </Link>
        )}

        {/* trending */}
        <Eyebrow>Trending this week</Eyebrow>
        <div className="flex flex-col gap-2.5">
          {trending.map((track) => (
            <TrackRow
              key={track.id}
              href={`/track/${track.slug}`}
              gradient={track.coverGradient}
              title={track.title}
              subtitle={`${track.artist.name} · ${track.genre}`}
              right={<VerificationBadge status={track.verification} />}
            />
          ))}
          {trending.length === 0 && (
            <p className="py-6 text-center text-sm text-neutral-600">
              No tracks in this genre yet —{" "}
              <Link href="/submit" className="font-bold text-sage-700">
                be the first to submit lyrics
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
