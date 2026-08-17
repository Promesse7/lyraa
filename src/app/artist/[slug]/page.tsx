import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { compact, getArtistProfile } from "@/lib/queries";
import { BackButton } from "@/components/ui/back-button";
import { TabBar } from "@/components/ui/tab-bar";
import { VerifiedBadgeIcon, ChevronRightIcon } from "@/components/ui/icons";
import { CoverArt, Eyebrow, TrackRow } from "@/components/ui/primitives";
import { FollowButton } from "./follow-button";

export async function generateMetadata({
  params,
}: PageProps<"/artist/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const artist = await db.artist.findUnique({
    where: { slug },
    select: { name: true },
  });
  return { title: artist?.name ?? "Artist" };
}

export default async function ArtistPage({
  params,
}: PageProps<"/artist/[slug]">) {
  const { slug } = await params;
  const profile = await getArtistProfile(slug);
  if (!profile) notFound();
  const { artist, artistNotes } = profile;

  const session = await auth();
  const user = session?.user;
  const following = user
    ? !!(await db.follow.findUnique({
        where: { userId_artistId: { userId: user.id, artistId: artist.id } },
      }))
    : false;

  const verifiedTracks = artist.tracks.filter(
    (t) => t.verification !== "COMMUNITY"
  );
  const otherTracks = artist.tracks.filter(
    (t) => t.verification === "COMMUNITY"
  );

  return (
    <main className="flex min-h-dvh flex-col">
      {/* sage hero */}
      <div className="relative overflow-hidden bg-sage-800 px-[22px] pt-14 pb-[22px] text-white">
        <div
          aria-hidden
          className="absolute -right-[50px] -bottom-[70px] h-[200px] w-[200px] rounded-full bg-sage-700"
        />
        <BackButton className="text-white hover:bg-sage-700/60" />
        <div className="relative mt-3 flex items-center gap-4">
          <div className="rounded-full border-[3px] border-sage-300">
            <CoverArt
              gradient={artist.avatarGradient}
              size={76}
              radius="50%"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-2xl">{artist.name}</h2>
              {artist.verified && (
                <VerifiedBadgeIcon size={18} color="#ffc6a5" />
              )}
            </div>
            <div className="text-[12.5px] text-sage-200">
              {artist.verified ? "Verified artist · " : ""}
              {artist.genres}
              {artist.location ? ` · ${artist.location}` : ""}
            </div>
          </div>
        </div>
        <div className="relative mt-4 flex gap-[22px]">
          <div>
            <div className="font-heading text-[19px]">
              {verifiedTracks.length}
            </div>
            <div className="text-[11px] text-sage-200">Verified tracks</div>
          </div>
          <div>
            <div className="font-heading text-[19px]">{artistNotes}</div>
            <div className="text-[11px] text-sage-200">Artist notes</div>
          </div>
          <div>
            <div className="font-heading text-[19px]">
              {compact(artist.followersCount)}
            </div>
            <div className="text-[11px] text-sage-200">Followers</div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-[22px] pt-4 pb-4">
        {artist.pinnedInterpretation && (
          <div className="rounded-2xl bg-accent-100 px-3.5 py-3">
            <div className="mb-1 text-[11px] font-bold tracking-[0.05em] uppercase text-accent-700">
              📌 Pinned interpretation
            </div>
            <div className="text-[13px] leading-normal">
              {artist.pinnedInterpretation}{" "}
              {artist.pinnedInterpretationBy && (
                <span className="text-neutral-600">
                  — {artist.pinnedInterpretationBy}
                </span>
              )}
            </div>
          </div>
        )}

        {verifiedTracks.length > 0 && (
          <>
            <Eyebrow>Verified lyrics</Eyebrow>
            <div className="flex flex-col gap-2.5">
              {verifiedTracks.map((track) => (
                <TrackRow
                  key={track.id}
                  href={`/track/${track.slug}`}
                  gradient={track.coverGradient}
                  title={track.title}
                  subtitle={`${track.releaseYear ?? ""}${
                    track.releaseYear ? " · " : ""
                  }${track._count.annotations} annotations`}
                  right={
                    <ChevronRightIcon size={16} className="text-neutral-500" />
                  }
                />
              ))}
            </div>
          </>
        )}

        {otherTracks.length > 0 && (
          <>
            <Eyebrow>Community drafts</Eyebrow>
            <div className="flex flex-col gap-2.5">
              {otherTracks.map((track) => (
                <TrackRow
                  key={track.id}
                  href={`/track/${track.slug}`}
                  gradient={track.coverGradient}
                  title={track.title}
                  subtitle={`${track.releaseYear ?? ""}${
                    track.releaseYear ? " · " : ""
                  }${track._count.annotations} annotations`}
                  right={
                    <ChevronRightIcon size={16} className="text-neutral-500" />
                  }
                />
              ))}
            </div>
          </>
        )}

        {artist.bio && (
          <p className="text-[13px] leading-normal text-neutral-700">
            {artist.bio}
          </p>
        )}

        <FollowButton
          artistId={artist.id}
          slug={artist.slug}
          initiallyFollowing={following}
          isAuthed={!!user}
        />
      </div>

      <TabBar />
    </main>
  );
}
