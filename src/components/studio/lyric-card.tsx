import { forwardRef } from "react";
import { MusicIcon } from "@/components/ui/icons";
import { CARD_THEME_STYLES } from "@/lib/card-themes";
import type { CardAspect, CardTheme } from "@/lib/constants";

/**
 * The exportable lyric card (design screen 06 preview & screen 07 feed).
 * Pure inline-styled markup so html-to-image renders it 1:1.
 */
export const LyricCard = forwardRef<
  HTMLDivElement,
  {
    lines: string;
    translation?: string | null;
    theme: CardTheme;
    aspect: CardAspect;
    attribution: string;
    compact?: boolean;
  }
>(function LyricCard(
  { lines, translation, theme, aspect, attribution, compact },
  ref
) {
  const style = CARD_THEME_STYLES[theme];
  const dark = theme !== "cream";
  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        aspectRatio: aspect === "story" ? "9/16" : "4/5",
        borderRadius: compact ? 16 : 28,
        background: style.background,
        color: style.text,
        padding: compact ? 22 : 26,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.04em",
          opacity: dark ? 1 : 0.85,
        }}
      >
        <MusicIcon size={14} />
        LYRAA
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: compact ? 19 : 25,
            lineHeight: 1.3,
          }}
        >
          &ldquo;{lines}&rdquo;
        </div>
        {translation && (
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 10 }}>
            {translation}
          </div>
        )}
      </div>
      <div style={{ fontSize: compact ? 11.5 : 12, opacity: 0.9 }}>
        {attribution} · lyraa.rw
      </div>
    </div>
  );
});
