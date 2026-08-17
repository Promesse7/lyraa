"use client";

import { useState, type ReactNode } from "react";
import { ShareIcon } from "./icons";

/** Web Share API with clipboard fallback. */
export function ShareButton({
  title,
  text,
  path,
  className = "",
  children,
}: {
  title: string;
  text?: string;
  path: string;
  className?: string;
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <button
      type="button"
      aria-label="Share"
      onClick={share}
      className={
        className ||
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-neutral-200/60"
      }
    >
      {copied ? (
        <span className="text-[10px] font-bold text-sage-700">Copied</span>
      ) : (
        children ?? <ShareIcon size={20} />
      )}
    </button>
  );
}
