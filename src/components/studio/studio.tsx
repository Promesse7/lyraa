"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toPng, toBlob } from "html-to-image";
import { ImageIcon } from "@/components/ui/icons";
import { CARD_THEME_STYLES } from "@/lib/card-themes";
import {
  CARD_THEMES,
  type CardAspect,
  type CardTheme,
} from "@/lib/constants";
import { postCardToFeed } from "@/app/track/[slug]/card/actions";
import { LyricCard } from "./lyric-card";

export type StudioLine = {
  id: string;
  order: number;
  textRw: string;
  textEn: string | null;
};

const MAX_LINES = 4;

export function Studio({
  trackId,
  trackTitle,
  artistName,
  lines,
  initialOrder,
  isAuthed,
}: {
  trackId: string;
  trackTitle: string;
  artistName: string;
  lines: StudioLine[];
  initialOrder: number | null;
  isAuthed: boolean;
}) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const sorted = useMemo(
    () => [...lines].sort((a, b) => a.order - b.order),
    [lines]
  );
  const initialIndex = Math.max(
    0,
    sorted.findIndex((l) => l.order === initialOrder)
  );
  // selection is a contiguous index range [start, end], 1–4 lines (spec §4)
  const [range, setRange] = useState<[number, number]>([
    initialIndex,
    initialIndex,
  ]);
  const [theme, setTheme] = useState<CardTheme>("terracotta");
  const [aspect, setAspect] = useState<CardAspect>("post");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [start, end] = range;
  const selected = sorted.slice(start, end + 1);
  const linesText = selected.map((l) => l.textRw).join("\n");
  const translation = selected
    .map((l) => l.textEn)
    .filter(Boolean)
    .join(" / ");

  function tapLine(index: number) {
    if (index < start - 1 || index > end + 1) {
      setRange([index, index]); // jump: new single selection
    } else if (index >= start && index <= end) {
      setRange([index, index]); // inside: collapse to this line
    } else if (end - start + 1 >= MAX_LINES) {
      setRange([index, index]); // full: start over
    } else if (index === start - 1) {
      setRange([index, end]); // extend up
    } else {
      setRange([start, index]); // extend down
    }
  }

  async function renderPng(): Promise<string | null> {
    if (!cardRef.current) return null;
    const width = cardRef.current.offsetWidth;
    return toPng(cardRef.current, {
      pixelRatio: 1080 / width,
      cacheBust: true,
    });
  }

  async function exportPng() {
    setBusy("export");
    try {
      const dataUrl = await renderPng();
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `lyraa-${trackTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
      a.click();
    } finally {
      setBusy(null);
    }
  }

  async function shareTo(label: string) {
    setBusy(label);
    try {
      if (!cardRef.current) return;
      const width = cardRef.current.offsetWidth;
      const blob = await toBlob(cardRef.current, {
        pixelRatio: 1080 / width,
        cacheBust: true,
      });
      if (!blob) return;
      const file = new File([blob], "lyraa-card.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator
          .share({
            files: [file],
            title: `${trackTitle} — ${artistName}`,
            text: `“${linesText}” · lyraa.rw`,
          })
          .catch(() => {});
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "lyraa-card.png";
        a.click();
      }
    } finally {
      setBusy(null);
    }
  }

  function postToFeed() {
    if (!isAuthed) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      const res = await postCardToFeed({
        trackId,
        linesText,
        translation: translation || undefined,
        theme,
        aspect,
        caption: caption || undefined,
      });
      if (!res.ok) {
        if (res.error === "signin") router.push("/login");
        return;
      }
      router.push("/feed");
    });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-900 text-neutral-100">
      {/* header */}
      <div className="flex items-center justify-between px-[22px] pt-14 pb-2.5">
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-11 text-sm font-semibold text-neutral-400"
        >
          Cancel
        </button>
        <span className="font-heading text-[17px]">Lyric card</span>
        <button
          type="button"
          disabled={busy !== null}
          onClick={exportPng}
          className="min-h-11 text-sm font-bold text-accent-400 disabled:opacity-45"
        >
          {busy === "export" ? "Saving…" : "Export"}
        </button>
      </div>

      {/* preview */}
      <div className="flex flex-1 items-center justify-center px-[34px] py-2.5">
        <div
          className="w-full shadow-lg"
          style={{ maxWidth: aspect === "story" ? 250 : 330 }}
        >
          <LyricCard
            ref={cardRef}
            lines={linesText}
            translation={translation || null}
            theme={theme}
            aspect={aspect}
            attribution={`${trackTitle} — ${artistName}`}
          />
        </div>
      </div>

      {/* line picker */}
      <div className="px-[22px] pb-2">
        <div className="mb-2.5 text-[11px] font-bold tracking-[0.06em] uppercase text-neutral-400">
          Lines · pick up to {MAX_LINES} consecutive
        </div>
        <div className="no-scrollbar flex max-h-28 flex-col gap-1.5 overflow-y-auto">
          {sorted.map((line, i) => {
            const on = i >= start && i <= end;
            return (
              <button
                key={line.id}
                type="button"
                onClick={() => tapLine(i)}
                className={`truncate rounded-full px-3.5 py-1.5 text-left text-[12.5px] ${
                  on
                    ? "bg-accent font-bold text-white"
                    : "bg-neutral-800 text-neutral-300"
                }`}
              >
                {line.textRw}
              </button>
            );
          })}
        </div>
      </div>

      {/* background + format */}
      <div className="px-[22px] pb-2 pt-2">
        <div className="mb-2.5 text-[11px] font-bold tracking-[0.06em] uppercase text-neutral-400">
          Background
        </div>
        <div className="flex items-center gap-2.5">
          {CARD_THEMES.map((t) => (
            <button
              key={t}
              type="button"
              aria-label={`${t} background`}
              onClick={() => setTheme(t)}
              className={`h-11 w-11 rounded-full ${
                theme === t ? "border-[2.5px] border-accent-300" : ""
              }`}
              style={{ background: CARD_THEME_STYLES[t].swatch }}
            />
          ))}
          <button
            type="button"
            title="Custom artwork — coming in v1.1"
            disabled
            className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-dashed border-neutral-500 text-neutral-400 opacity-60"
          >
            <ImageIcon size={16} />
          </button>
          <div className="ml-auto flex overflow-hidden rounded-full border border-neutral-700 text-[11.5px] font-bold">
            {(["post", "story"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAspect(a)}
                className={`px-3 py-1.5 ${
                  aspect === a ? "bg-neutral-100 text-neutral-900" : "text-neutral-300"
                }`}
              >
                {a === "post" ? "4:5" : "9:16"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* caption + share */}
      <div className="flex flex-col gap-2.5 px-[22px] pt-2.5 pb-[max(env(safe-area-inset-bottom),36px)]">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption for the feed…"
          maxLength={300}
          className="h-11 w-full rounded-full border border-neutral-700 bg-neutral-800 px-4 text-[13.5px] text-neutral-100 placeholder:text-neutral-500 focus-visible:border-accent-400 focus-visible:outline-none"
        />
        <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-neutral-400">
          Share to
        </div>
        <div className="flex gap-2.5">
          {["Story", "Status", "TikTok"].map((label) => (
            <button
              key={label}
              type="button"
              disabled={busy !== null}
              onClick={() => shareTo(label)}
              className="h-[46px] flex-1 rounded-full bg-neutral-800 text-[12.5px] font-bold disabled:opacity-45"
            >
              {busy === label ? "…" : label}
            </button>
          ))}
          <button
            type="button"
            disabled={pending}
            onClick={postToFeed}
            className="h-[46px] flex-1 rounded-full bg-accent text-[12.5px] font-bold text-white disabled:opacity-45"
          >
            {pending ? "Posting…" : "Post to feed"}
          </button>
        </div>
      </div>
    </div>
  );
}
