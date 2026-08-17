"use client";

import { useState, useTransition } from "react";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";
import { requestLyricsAction } from "./actions";

export function RequestLyricsButton({ query }: { query: string }) {
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  if (sent) {
    return (
      <div className="flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-sage-100 text-[13px] font-bold text-sage-700">
        <CheckIcon size={15} />
        Request sent — we&apos;ll chase these lyrics
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await requestLyricsAction(query);
          if (res.ok) setSent(true);
        })
      }
      className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border-[1.5px] border-dashed border-sage-500 text-[13px] font-bold text-sage-700 hover:bg-sage-100 disabled:opacity-45"
    >
      <PlusIcon size={15} />
      Can&apos;t find it? Request these lyrics
    </button>
  );
}
