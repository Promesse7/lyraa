"use client";

import { useEffect, useState, useTransition } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/primitives";
import {
  addLineComment,
  getLineComments,
} from "@/app/track/[slug]/actions";
import type { ReaderLine } from "./types";

type Comment = Awaited<ReturnType<typeof getLineComments>>[number];

export function CommentsSheet({
  line,
  trackSlug,
  canComment,
  onClose,
  onRequireAuth,
  onPosted,
}: {
  line: ReaderLine | null;
  trackSlug: string;
  canComment: boolean;
  onClose: () => void;
  onRequireAuth: () => void;
  onPosted: () => void;
}) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!line) return;
    setComments(null);
    getLineComments(line.id).then(setComments);
  }, [line]);

  if (!line) return null;

  function post() {
    if (!canComment) {
      onRequireAuth();
      return;
    }
    const text = body.trim();
    if (text.length < 2) return;
    startTransition(async () => {
      const res = await addLineComment(line!.id, text, trackSlug);
      if (!res.ok) {
        if (res.error === "signin") onRequireAuth();
        return;
      }
      setBody("");
      onPosted();
      const fresh = await getLineComments(line!.id);
      setComments(fresh);
    });
  }

  return (
    <Sheet open onClose={onClose} top="34%">
      <h3 className="mb-1 text-xl">Interpretations</h3>
      <p className="mb-3 text-[13px] leading-normal text-neutral-600">
        &ldquo;{line.textRw}&rdquo;
      </p>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {comments === null && (
          <p className="py-4 text-center text-[13px] text-neutral-500">
            Loading…
          </p>
        )}
        {comments?.length === 0 && (
          <p className="py-4 text-center text-[13px] text-neutral-500">
            No interpretations yet — share what this line means to you.
          </p>
        )}
        {comments?.map((comment) => (
          <div key={comment.id} className="flex gap-2.5">
            <Avatar
              initials={comment.username.slice(0, 2).toUpperCase()}
              size={30}
              tone={comment.avatarTone as "sage" | "accent" | "neutral"}
            />
            <div className="min-w-0 flex-1 rounded-2xl bg-neutral-100 px-3 py-2">
              <div className="text-xs font-bold">{comment.username}</div>
              <div className="text-[13.5px] leading-normal">{comment.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-divider pt-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && post()}
          placeholder={
            canComment ? "Add your interpretation…" : "Sign in to interpret"
          }
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
  );
}
