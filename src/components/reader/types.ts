import type { AnnotationKind, Language } from "@/lib/constants";

export type ReaderAnnotation = {
  id: string;
  phrase: string;
  kind: AnnotationKind;
  literal: string;
  poetic: string;
  culturalContext: string | null;
  artistNote: string | null;
  artistNoteBy: string | null;
  annotatedBy: string;
  upvotes: number;
};

export type ReaderLine = {
  id: string;
  order: number;
  textRw: string;
  textEn: string | null;
  textFr: string | null;
  likesCount: number;
  commentsCount: number;
  annotations: ReaderAnnotation[];
};

export type ReaderSection = {
  id: string;
  label: string;
  lines: ReaderLine[];
};

export type ReaderTrack = {
  id: string;
  slug: string;
  title: string;
  artistName: string;
  sections: ReaderSection[];
};

export const LANGUAGE_TABS: { code: Language; label: string }[] = [
  { code: "rw", label: "Ikinyarwanda" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];
