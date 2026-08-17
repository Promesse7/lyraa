"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CardPlusIcon, ChatIcon, HeartIcon } from "@/components/ui/icons";
import { Eyebrow } from "@/components/ui/primitives";
import type { Language } from "@/lib/constants";
import { toggleLineLike } from "@/app/track/[slug]/actions";
import { AnnotationSheet } from "./annotation-sheet";
import { CommentsSheet } from "./comments-sheet";
import {
  LANGUAGE_TABS,
  type ReaderAnnotation,
  type ReaderLine,
  type ReaderTrack,
} from "./types";

/** Wrap annotated phrases in tappable terracotta dotted-underline spans. */
function annotate(
  text: string,
  annotations: ReaderAnnotation[],
  onOpen: (a: ReaderAnnotation) => void
): ReactNode {
  let parts: Array<string | ReactNode> = [text];
  for (const annotation of annotations) {
    const next: Array<string | ReactNode> = [];
    for (const part of parts) {
      if (typeof part !== "string") {
        next.push(part);
        continue;
      }
      const i = part.toLowerCase().indexOf(annotation.phrase.toLowerCase());
      if (i === -1) {
        next.push(part);
        continue;
      }
      next.push(
        part.slice(0, i),
        <button
          key={annotation.id}
          type="button"
          className="annotated"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(annotation);
          }}
        >
          {part.slice(i, i + annotation.phrase.length)}
        </button>,
        part.slice(i + annotation.phrase.length)
      );
    }
    parts = next;
  }
  return <>{parts}</>;
}

function lineText(line: ReaderLine, lang: Language): string {
  if (lang === "en") return line.textEn ?? line.textRw;
  if (lang === "fr") return line.textFr ?? line.textRw;
  return line.textRw;
}

function glossText(line: ReaderLine, lang: Language): string | null {
  // rw shows the English gloss under each line (design screen 04);
  // en/fr show the original Kinyarwanda as the gloss.
  return lang === "rw" ? line.textEn : line.textRw;
}

export function Reader({
  track,
  likedLineIds,
  upvotedAnnotationIds,
  canComment,
}: {
  track: ReaderTrack;
  likedLineIds: string[];
  upvotedAnnotationIds: string[];
  canComment: boolean;
}) {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("rw");
  const allLines = useMemo(
    () => track.sections.flatMap((s) => s.lines),
    [track]
  );
  const defaultActive = useMemo(
    () =>
      allLines.reduce(
        (best, line) => (line.likesCount > (best?.likesCount ?? -1) ? line : best),
        null as ReaderLine | null
      ),
    [allLines]
  );
  const [activeLineId, setActiveLineId] = useState<string | null>(
    defaultActive?.id ?? null
  );
  const [openAnnotation, setOpenAnnotation] = useState<ReaderAnnotation | null>(
    null
  );
  const [commentsLine, setCommentsLine] = useState<ReaderLine | null>(null);
  const [likeOverride, setLikeOverride] = useState<Record<string, boolean>>({});
  const [commentBump, setCommentBump] = useState<Record<string, number>>({});
  const [, startTransition] = useTransition();

  const likedSet = useMemo(() => new Set(likedLineIds), [likedLineIds]);
  const isLiked = (id: string) => likeOverride[id] ?? likedSet.has(id);
  const likeCount = (line: ReaderLine) =>
    line.likesCount +
    (isLiked(line.id) ? 1 : 0) -
    (likedSet.has(line.id) ? 1 : 0);

  const requireAuth = () => router.push("/login");

  function like(line: ReaderLine) {
    startTransition(async () => {
      const res = await toggleLineLike(line.id);
      if (!res.ok) {
        requireAuth();
        return;
      }
      setLikeOverride((prev) => ({ ...prev, [line.id]: res.liked }));
    });
  }

  const activeLine = allLines.find((l) => l.id === activeLineId) ?? null;

  return (
    <>
      {/* language tabs */}
      <div className="flex gap-1.5 px-[22px] pt-3">
        {LANGUAGE_TABS.map((tab) => (
          <button
            key={tab.code}
            type="button"
            onClick={() => setLang(tab.code)}
            className={`inline-flex h-[34px] items-center rounded-full px-4 text-[13px] ${
              lang === tab.code
                ? "bg-ink font-bold text-bg"
                : "bg-neutral-200 font-semibold"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* lyric body */}
      <div className="flex-1 px-[22px] pt-5 pb-3">
        {track.sections.map((section) => (
          <section key={section.id} className="mb-6">
            <div className="mb-3.5">
              <Eyebrow>{section.label}</Eyebrow>
            </div>
            <div className="flex flex-col gap-[18px] text-lg leading-normal">
              {section.lines.map((line) => {
                const active = line.id === activeLineId;
                const gloss = glossText(line, lang);
                return (
                  <div
                    key={line.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setActiveLineId(active ? null : line.id)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      setActiveLineId(active ? null : line.id)
                    }
                    className={
                      active
                        ? "-mx-3.5 rounded-2xl bg-accent-100 px-3.5 py-3"
                        : "cursor-pointer"
                    }
                  >
                    {annotate(
                      lineText(line, lang),
                      lang === "rw" ? line.annotations : [],
                      setOpenAnnotation
                    )}
                    {gloss && (
                      <div
                        className={`mt-[3px] text-[12.5px] ${
                          active ? "text-accent-800" : "text-neutral-600"
                        }`}
                      >
                        {lang === "rw"
                          ? gloss
                          : annotate(gloss, line.annotations, setOpenAnnotation)}
                      </div>
                    )}
                    {active && (
                      <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-accent-700">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            like(line);
                          }}
                          className="inline-flex min-h-8 items-center gap-1"
                        >
                          <HeartIcon size={13} filled={isLiked(line.id)} />
                          {likeCount(line)}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCommentsLine(line);
                          }}
                          className="inline-flex min-h-8 items-center gap-1"
                        >
                          <ChatIcon size={13} />
                          {line.commentsCount + (commentBump[line.id] ?? 0)}{" "}
                          interpretations
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* bottom CTA */}
      <div className="sticky bottom-0 flex gap-2.5 bg-gradient-to-t from-bg via-bg to-transparent px-[22px] pt-3 pb-[max(env(safe-area-inset-bottom),24px)]">
        <Link
          href={
            `/track/${track.slug}/card${
              activeLine ? `?line=${activeLine.order}` : ""
            }` as never
          }
          className="flex h-13 flex-1 items-center justify-center gap-2 rounded-full bg-accent font-heading text-[15px] text-white hover:bg-accent-600"
        >
          <CardPlusIcon size={17} />
          Make a lyric card
        </Link>
        <button
          type="button"
          aria-label="Like this line"
          disabled={!activeLine}
          onClick={() => activeLine && like(activeLine)}
          className={`flex h-13 w-13 items-center justify-center rounded-full border-[1.5px] disabled:opacity-45 ${
            activeLine && isLiked(activeLine.id)
              ? "border-accent bg-accent text-white"
              : "border-neutral-400 text-ink"
          }`}
        >
          <HeartIcon
            size={19}
            filled={!!activeLine && isLiked(activeLine.id)}
          />
        </button>
      </div>

      <AnnotationSheet
        annotation={openAnnotation}
        upvoted={
          !!openAnnotation && upvotedAnnotationIds.includes(openAnnotation.id)
        }
        onClose={() => setOpenAnnotation(null)}
        onRequireAuth={requireAuth}
      />
      <CommentsSheet
        line={commentsLine}
        trackSlug={track.slug}
        canComment={canComment}
        onClose={() => setCommentsLine(null)}
        onRequireAuth={requireAuth}
        onPosted={() =>
          commentsLine &&
          setCommentBump((prev) => ({
            ...prev,
            [commentsLine.id]: (prev[commentsLine.id] ?? 0) + 1,
          }))
        }
      />
    </>
  );
}
