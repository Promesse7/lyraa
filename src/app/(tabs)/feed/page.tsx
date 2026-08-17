import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getFeed, timeAgo } from "@/lib/queries";
import type { CardAspect, CardTheme } from "@/lib/constants";
import { FeedCard, type FeedCardData } from "@/components/feed/feed-card";

export const metadata: Metadata = { title: "Feed" };

export default async function FeedPage({ searchParams }: PageProps<"/feed">) {
  const params = await searchParams;
  const sort = params.sort === "latest" ? ("latest" as const) : ("foryou" as const);
  const [session, cards] = await Promise.all([auth(), getFeed(sort)]);
  const user = session?.user;

  const likedIds = user
    ? new Set(
        (
          await db.cardLike.findMany({
            where: { userId: user.id, cardId: { in: cards.map((c) => c.id) } },
            select: { cardId: true },
          })
        ).map((l) => l.cardId)
      )
    : new Set<string>();

  const feedCards: FeedCardData[] = cards.map((card) => ({
    id: card.id,
    linesText: card.linesText,
    translation: card.translation,
    theme: card.theme as CardTheme,
    aspect: card.aspect as CardAspect,
    caption: card.caption,
    isArtistNote: card.isArtistNote,
    likesCount: card.likesCount,
    commentsCount: card.commentsCount,
    timeAgo: timeAgo(card.createdAt),
    username: card.user.username,
    displayName: card.user.name,
    avatarTone: card.user.avatarTone,
    isArtistUser: card.user.role === "ARTIST",
    trackSlug: card.track.slug,
    trackTitle: card.track.title,
    artistName: card.track.artist.name,
  }));

  return (
    <main className="flex flex-1 flex-col pb-4">
      <div className="flex items-center justify-between px-[22px] pt-14 pb-2.5">
        <h2 className="text-[26px]">Feed</h2>
        <div className="flex gap-1.5">
          <Link
            href="/feed"
            className={`inline-flex h-8 items-center rounded-full px-3.5 text-[12.5px] ${
              sort === "foryou"
                ? "bg-ink font-bold text-bg"
                : "bg-neutral-200 font-semibold"
            }`}
          >
            For you
          </Link>
          <Link
            href="/feed?sort=latest"
            className={`inline-flex h-8 items-center rounded-full px-3.5 text-[12.5px] ${
              sort === "latest"
                ? "bg-ink font-bold text-bg"
                : "bg-neutral-200 font-semibold"
            }`}
          >
            Latest
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 px-[22px] pt-1">
        {feedCards.map((card) => (
          <FeedCard
            key={card.id}
            card={card}
            initiallyLiked={likedIds.has(card.id)}
            isAuthed={!!user}
          />
        ))}
        {feedCards.length === 0 && (
          <p className="py-10 text-center text-sm text-neutral-600">
            The feed is quiet — open any track and{" "}
            <span className="font-bold text-accent-700">make a lyric card</span>{" "}
            to start it off.
          </p>
        )}
      </div>
    </main>
  );
}
