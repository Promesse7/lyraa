import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { getTrackForReader } from "@/lib/queries";
import type { AnnotationKind } from "@/lib/constants";
import { BackButton } from "@/components/ui/back-button";
import { ShareButton } from "@/components/ui/share-button";
import { CoverArt } from "@/components/ui/primitives";
import { VerifiedBadgeIcon } from "@/components/ui/icons";
import { Reader } from "@/components/reader/reader";
import type { ReaderTrack } from "@/components/reader/types";
import { getMyLineState } from "./actions";

export async function generateMetadata({
  params,
}: PageProps<"/track/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const track = await getTrackForReader(slug);
  if (!track) return { title: "Track" };
  return {
    title: `${track.title} — ${track.artist.name}`,
    description: `Lyrics, translations and Deep Kinyarwanda annotations for ${track.title} by ${track.artist.name} on Lyraa.`,
  };
}

const verificationLabel: Record<string, string> = {
  ARTIST_VERIFIED: "Verified lyrics",
  EDITOR_APPROVED: "Editor approved",
  COMMUNITY: "Community draft",
};

export default async function TrackPage({ params }: PageProps<"/track/[slug]">) {
  const { slug } = await params;
  const track = await getTrackForReader(slug);
  if (!track) notFound();

  const session = await auth();
  const { likedLineIds, upvotedAnnotationIds } = await getMyLineState(track.id);

  const readerTrack: ReaderTrack = {
    id: track.id,
    slug: track.slug,
    title: track.title,
    artistName: track.artist.name,
    sections: track.sections.map((section) => ({
      id: section.id,
      label: section.label,
      lines: section.lines.map((line) => ({
        id: line.id,
        order: line.order,
        textRw: line.textRw,
        textEn: line.textEn,
        textFr: line.textFr,
        likesCount: line.likesCount,
        commentsCount: line._count.comments,
        annotations: line.annotations.map((a) => ({
          id: a.id,
          phrase: a.phrase,
          kind: a.kind as AnnotationKind,
          literal: a.literal,
          poetic: a.poetic,
          culturalContext: a.culturalContext,
          artistNote: a.artistNote,
          artistNoteBy: a.artistNoteBy,
          annotatedBy: a.annotatedBy,
          upvotes: a.upvotes,
        })),
      })),
    })),
  };

  return (
    <main className="flex min-h-dvh flex-col">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-divider px-[22px] pt-14 pb-3.5">
        <BackButton />
        <CoverArt gradient={track.coverGradient} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-heading text-base leading-tight">
            {track.title}
          </div>
          <div className="flex items-center gap-1 text-xs text-neutral-600">
            <Link
              href={`/artist/${track.artist.slug}` as never}
              className="truncate hover:text-accent"
            >
              {track.artist.name}
            </Link>
            {track.verification !== "COMMUNITY" && (
              <VerifiedBadgeIcon size={12} />
            )}
            <span className="truncate">
              {verificationLabel[track.verification]}
            </span>
          </div>
        </div>
        <ShareButton
          title={`${track.title} — ${track.artist.name}`}
          text={`Read the lyrics and meanings on Lyraa`}
          path={`/track/${track.slug}`}
        />
      </div>

      <Reader
        track={readerTrack}
        likedLineIds={likedLineIds}
        upvotedAnnotationIds={upvotedAnnotationIds}
        canComment={can(session?.user?.role, "comments:create")}
      />
    </main>
  );
}
