"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/rbac";
import { CARD_ASPECTS, CARD_THEMES } from "@/lib/constants";

const cardSchema = z.object({
  trackId: z.string().min(1),
  linesText: z.string().trim().min(2).max(600),
  translation: z.string().trim().max(600).optional(),
  theme: z.enum(CARD_THEMES),
  aspect: z.enum(CARD_ASPECTS),
  caption: z.string().trim().max(300).optional(),
});

export async function postCardToFeed(input: z.infer<typeof cardSchema>) {
  const session = await auth();
  const user = session?.user;
  if (!user || !can(user.role, "cards:create")) {
    return { ok: false as const, error: "signin" as const };
  }
  const parsed = cardSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "invalid" as const };

  const track = await db.track.findUnique({
    where: { id: parsed.data.trackId },
    select: { id: true, artist: { select: { userId: true } } },
  });
  if (!track) return { ok: false as const, error: "invalid" as const };

  await db.lyricCard.create({
    data: {
      userId: user.id,
      trackId: track.id,
      linesText: parsed.data.linesText,
      translation: parsed.data.translation || null,
      theme: parsed.data.theme,
      aspect: parsed.data.aspect,
      caption: parsed.data.caption || null,
      // artist posting on their own track = artist note (design screen 07)
      isArtistNote: user.role === "ARTIST" && track.artist.userId === user.id,
    },
  });
  return { ok: true as const };
}
