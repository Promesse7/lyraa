// Canonical unions for the string-typed columns in prisma/schema.prisma
// (SQLite has no enums; these are enforced with zod at every write path).

export const ROLES = ["FAN", "ARTIST", "EDITOR", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const GENRES = [
  "Gakondo",
  "Kinyatrap",
  "Gospel",
  "R&B",
  "Afrobeats",
  "Hip-Hop",
  "Drill",
  "Oldies",
] as const;
export type Genre = (typeof GENRES)[number];

export const VERIFICATIONS = [
  "ARTIST_VERIFIED",
  "EDITOR_APPROVED",
  "COMMUNITY",
] as const;
export type Verification = (typeof VERIFICATIONS)[number];

export const LANGUAGES = ["rw", "en", "fr"] as const;
export type Language = (typeof LANGUAGES)[number];

export const ANNOTATION_KINDS = [
  "CULTURAL_TERM",
  "PROVERB",
  "SLANG",
  "HISTORY",
] as const;
export type AnnotationKind = (typeof ANNOTATION_KINDS)[number];

export const ANNOTATION_KIND_LABELS: Record<AnnotationKind, string> = {
  CULTURAL_TERM: "Cultural term",
  PROVERB: "Proverb",
  SLANG: "Street slang",
  HISTORY: "Historical allusion",
};

export const SUBMISSION_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const CARD_THEMES = ["terracotta", "sage", "ink", "cream"] as const;
export type CardTheme = (typeof CARD_THEMES)[number];

export const CARD_ASPECTS = ["post", "story"] as const;
export type CardAspect = (typeof CARD_ASPECTS)[number];

/** Points awarded when an editor approves a lyric submission. */
export const SUBMISSION_POINTS = 40;
