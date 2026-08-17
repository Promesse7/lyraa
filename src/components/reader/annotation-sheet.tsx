"use client";

import { useState, useTransition } from "react";
import { Sheet } from "@/components/ui/sheet";
import { ArrowUpIcon } from "@/components/ui/icons";
import { ANNOTATION_KIND_LABELS } from "@/lib/constants";
import { upvoteAnnotation } from "@/app/track/[slug]/actions";
import type { ReaderAnnotation } from "./types";

function Section({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <div className="mb-[3px] text-[11px] font-bold tracking-[0.06em] uppercase text-accent-700">
        {label}
      </div>
      {children}
    </div>
  );
}

export function AnnotationSheet({
  annotation,
  upvoted,
  onClose,
  onRequireAuth,
}: {
  annotation: ReaderAnnotation | null;
  upvoted: boolean;
  onClose: () => void;
  onRequireAuth: () => void;
}) {
  const [localUpvoted, setLocalUpvoted] = useState<boolean | null>(null);
  const [pending, startTransition] = useTransition();
  if (!annotation) return null;

  const isUpvoted = localUpvoted ?? upvoted;
  const upvotes =
    annotation.upvotes + (isUpvoted ? 1 : 0) - (upvoted ? 1 : 0);

  function toggleUpvote() {
    startTransition(async () => {
      const res = await upvoteAnnotation(annotation!.id);
      if (!res.ok) {
        onRequireAuth();
        return;
      }
      setLocalUpvoted(res.upvoted);
    });
  }

  return (
    <Sheet open onClose={onClose}>
      <div className="mb-3.5 flex items-center gap-2.5">
        <h2 className="text-[30px] capitalize">{annotation.phrase}</h2>
        <span className="inline-flex h-[26px] items-center rounded-full bg-sage-200 px-3 text-xs font-bold text-sage-800">
          {ANNOTATION_KIND_LABELS[annotation.kind]}
        </span>
      </div>

      <div className="flex flex-col gap-3.5 text-[14.5px] leading-[1.55]">
        <Section label="Literal meaning">{annotation.literal}</Section>
        <Section label="Poetic meaning">{annotation.poetic}</Section>
        {annotation.culturalContext && (
          <Section label="Cultural context">{annotation.culturalContext}</Section>
        )}
      </div>

      {annotation.artistNote && (
        <div className="mt-4 rounded-2xl bg-sage-100 px-3.5 py-3">
          <div className="mb-1.5 flex items-center gap-2">
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-sage-600 text-[11px] font-bold text-white">
              {annotation.artistNoteBy
                ?.split(/\s+/)
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="text-xs font-bold">
              {annotation.artistNoteBy}{" "}
              <span className="text-sage-700">· Artist note</span>
            </div>
          </div>
          <div className="text-[13px] leading-normal">
            &ldquo;{annotation.artistNote}&rdquo;
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-divider pt-3.5">
        <span className="text-xs text-neutral-600">
          Annotated by <b>{annotation.annotatedBy}</b> · {upvotes} upvotes
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={toggleUpvote}
          className={`inline-flex h-9 items-center gap-[5px] rounded-full border-[1.5px] px-3.5 text-[12.5px] font-bold disabled:opacity-45 ${
            isUpvoted
              ? "border-sage-600 bg-sage-600 text-white"
              : "border-sage-500 text-sage-700 hover:bg-sage-100"
          }`}
        >
          <ArrowUpIcon size={13} />
          {isUpvoted ? "Upvoted" : "Upvote"}
        </button>
      </div>
    </Sheet>
  );
}
