"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChatIcon,
  HeartIcon,
  MoreIcon,
  VerifiedBadgeIcon,
} from "@/components/ui/icons";
import { Avatar } from "@/components/ui/primitives";
import { ShareButton } from "@/components/ui/share-button";
import { Sheet } from "@/components/ui/sheet";
import { LyricCard } from "@/components/studio/lyric-card";
import type { CardAspect, CardTheme } from "@/lib/constants";
import {
  addCardComment,
  getCardComments,
  toggleCardLike,
} from "@/app/(tabs)/feed/actions";

export type FeedCardData = {
  id: string;
  linesText: string;
  translation: string | null;
  theme: CardTheme;
  aspect: CardAspect;
  caption: string | null;
  isArtistNote: boolean;
  likesCount: number;
  commentsCount: number;
  timeAgo: string;
  username: string;
  displayName: string;
  avatarTone: string;
  isArtistUser: boolean;
  trackSlug: string;
  trackTitle: string;
  artistName: string;
};

type Comment = Awaited<ReturnType<typeof getCardComments>>[number];

export function FeedCard({
  card,
  initiallyLiked,
  isAuthed,
}: {
  card: FeedCardData;
  initiallyLiked: boolean;
  isAuthed: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initiallyLiked);
  const [likes, setLikes] = useState(card.likesCount);
  const [comments, setComments] = useState(card.commentsCount);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [thread, setThread] = useState<Comment[] | null>(null);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!sheetOpen) return;
    setThread(null);
    getCardComments(card.id).then(setThread);
  }, [sheetOpen, card.id]);

  function like() {
    if (!isAuthed) {
      router.push("/login");
      return;
    }
    // optimistic
    setLiked((v) => !v);
    setLikes((n) => n + (liked ? -1 : 1));
    startTransition(async () => {
      const res = await toggleCardLike(card.id);
      if (!res.ok) {
        setLiked(initiallyLiked);
        setLikes(card.likesCount);
        router.push("/login");
      }
    });
  }

  function post() {
    if (!isAuthed) {
      router.push("/login");
      return;
    }
    const text = body.trim();
    if (text.length < 2) return;
    startTransition(async () => {
      const res = await addCardComment(card.id, text);
      if (!res.ok) return;
      setBody("");
      setComments((n) => n + 1);
      const fresh = await getCardComments(card.id);
      setThread(fresh);
    });
  }

  const compactNum = (n: number) =>
    n < 1000 ? String(n) : `${(n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, "")}k`;

  return (
    <article className="overflow-hidden rounded-[28px] bg-neutral-100 shadow-sm">
      {/* header */}
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <Avatar
          initials={card.displayName
            .split(/\s+/)
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
          size={36}
          tone={card.avatarTone as "sage" | "accent" | "neutral"}
        />
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-1 text-[13.5px] font-bold">
            {card.isArtistUser ? card.displayName : card.username}
            {card.isArtistUser && <VerifiedBadgeIcon size={13} />}
          </div>
          <div className="text-[11.5px] text-neutral-600">
            {card.timeAgo} ·{" "}
            {card.isArtistNote
              ? "pinned an artist note"
              : `from ${card.trackTitle}`}
          </div>
        </div>
        <MoreIcon size={18} className="text-neutral-600" />
      </div>

      {/* rendered lyric card */}
      <Link href={`/track/${card.trackSlug}` as never} className="mx-3.5 block">
        <LyricCard
          lines={card.linesText}
          translation={card.translation}
          theme={card.theme}
          aspect="post"
          attribution={`${card.trackTitle} · ${card.artistName}`}
          compact
        />
      </Link>

      {/* caption */}
      {card.caption && (
        <p className="px-3.5 pt-2.5 pb-1.5 text-[13.5px] leading-[1.45]">
          {card.caption}
        </p>
      )}

      {/* actions */}
      <div className="flex items-center gap-[18px] px-3.5 pt-1.5 pb-3 text-neutral-700">
        <button
          type="button"
          onClick={like}
          className={`inline-flex min-h-8 items-center gap-[5px] text-[12.5px] ${
            liked ? "font-bold text-accent-700" : "font-semibold"
          }`}
        >
          <HeartIcon
            size={16}
            filled={liked}
            className={liked ? "text-accent" : undefined}
          />
          {compactNum(likes)}
        </button>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="inline-flex min-h-8 items-center gap-[5px] text-[12.5px] font-semibold"
        >
          <ChatIcon size={16} />
          {compactNum(comments)}
        </button>
        <ShareButton
          title={`${card.trackTitle} — ${card.artistName}`}
          text={`“${card.linesText}” · Lyraa`}
          path={`/track/${card.trackSlug}`}
          className="inline-flex min-h-8 items-center gap-[5px] text-[12.5px] font-semibold"
        >
          <span className="inline-flex items-center gap-[5px]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
              <path d="m16 6-4-4-4 4" />
              <path d="M12 2v13" />
            </svg>
            Share
          </span>
        </ShareButton>
      </div>

      {/* comments sheet */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} top="34%">
        <h3 className="mb-3 text-xl">Comments</h3>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {thread === null && (
            <p className="py-4 text-center text-[13px] text-neutral-500">
              Loading…
            </p>
          )}
          {thread?.length === 0 && (
            <p className="py-4 text-center text-[13px] text-neutral-500">
              No comments yet — say something.
            </p>
          )}
          {thread?.map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <Avatar
                initials={comment.username.slice(0, 2).toUpperCase()}
                size={30}
                tone={comment.avatarTone as "sage" | "accent" | "neutral"}
              />
              <div className="min-w-0 flex-1 rounded-2xl bg-neutral-100 px-3 py-2">
                <div className="text-xs font-bold">{comment.username}</div>
                <div className="text-[13.5px] leading-normal">
                  {comment.body}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-divider pt-3">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && post()}
            placeholder={isAuthed ? "Add a comment…" : "Sign in to comment"}
            className="h-11 min-w-0 flex-1 rounded-full border border-neutral-300 bg-neutral-100 px-4 text-[14px] placeholder:text-neutral-500 focus-visible:border-accent focus-visible:outline-offset-0"
          />
          <button
            type="button"
            disabled={pending || body.trim().length < 2}
            onClick={post}
            className="h-11 shrink-0 rounded-full bg-accent px-4 font-heading text-sm text-white disabled:opacity-45"
          >
            Post
          </button>
        </div>
      </Sheet>
    </article>
  );
}
