import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { searchAll } from "@/lib/queries";
import { Eyebrow, TrackRow } from "@/components/ui/primitives";
import { SearchBox } from "./search-box";
import { RequestLyricsButton } from "./request-button";

export const metadata: Metadata = { title: "Search" };

/** Wrap query matches in the design's accent-200 highlight pill. */
function highlight(text: string, q: string): ReactNode {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="rounded bg-accent-200 px-0.5">
        {text.slice(i, i + q.length)}
      </span>
      {highlight(text.slice(i + q.length), q)}
    </>
  );
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const { tracks, verseMatches } = q
    ? await searchAll(q)
    : { tracks: [], verseMatches: [] };
  const hasQuery = q.length >= 2;

  return (
    <main className="flex flex-1 flex-col pb-4">
      <div className="px-[22px] pt-14">
        <h2 className="mb-3 text-[26px]">Search</h2>
        <SearchBox initial={q} />
        <div className="mt-2 text-[11px] text-neutral-600">
          Search by title, artist, genre — or any verse you remember
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-[22px] pt-4">
        {hasQuery && (
          <>
            <Eyebrow>Results</Eyebrow>

            {tracks.map((track) => (
              <TrackRow
                key={track.id}
                href={`/track/${track.slug}`}
                gradient={track.coverGradient}
                title={highlight(track.title, q)}
                subtitle={`${track.artist.name} · ${track.genre}${
                  track.releaseYear ? ` · ${track.releaseYear}` : ""
                }`}
              />
            ))}

            {verseMatches.map((line) => (
              <Link
                key={line.id}
                href={`/track/${line.track.slug}` as never}
                className="rounded-2xl bg-sage-100 px-3.5 py-3"
              >
                <div className="mb-1 text-[11px] font-bold tracking-[0.05em] uppercase text-sage-700">
                  Verse match
                </div>
                <div className="text-[13px] leading-normal">
                  &ldquo;…{highlight(line.textRw, q)}…&rdquo;
                </div>
                <div className="mt-1 text-xs text-neutral-600">
                  {line.track.title} — {line.track.artist.name},{" "}
                  {line.section.label.toLowerCase()}
                </div>
              </Link>
            ))}

            {tracks.length === 0 && verseMatches.length === 0 && (
              <p className="py-2 text-center text-sm text-neutral-600">
                Nothing in the archive for &ldquo;{q}&rdquo; yet.
              </p>
            )}

            <RequestLyricsButton query={q} />
          </>
        )}

        {!hasQuery && (
          <p className="py-8 text-center text-sm text-neutral-600">
            Type at least two letters to search the archive.
          </p>
        )}
      </div>
    </main>
  );
}
