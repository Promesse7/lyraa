import type { CardTheme } from "./constants";

/**
 * Lyric-card backgrounds (design screen 06): terracotta radial (default),
 * sage radial, ink radial, cream solid. CSS strings are shared by the
 * studio preview, the feed renderer, and the swatch picker.
 */
export const CARD_THEME_STYLES: Record<
  CardTheme,
  { background: string; text: string; swatch: string }
> = {
  terracotta: {
    background:
      "radial-gradient(120% 120% at 20% 10%, #f6a06b, #643312)",
    text: "#ffffff",
    swatch: "radial-gradient(circle at 30% 20%, #f6a06b, #643312)",
  },
  sage: {
    background: "radial-gradient(120% 120% at 20% 10%, #ccdbb2, #3d472b)",
    text: "#ffffff",
    swatch: "radial-gradient(circle at 30% 20%, #ccdbb2, #3d472b)",
  },
  ink: {
    background: "radial-gradient(120% 120% at 20% 10%, #dcd3c4, #2e2b25)",
    text: "#ffffff",
    swatch: "radial-gradient(circle at 30% 20%, #dcd3c4, #2e2b25)",
  },
  cream: {
    background: "#f5ead8",
    text: "#201e1d",
    swatch: "#f5ead8",
  },
};
