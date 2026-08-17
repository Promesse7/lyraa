"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const requestSchema = z.string().trim().min(2).max(200);

export async function requestLyricsAction(query: string) {
  const parsed = requestSchema.safeParse(query);
  if (!parsed.success) return { ok: false as const };
  const session = await auth();
  await db.lyricRequest.create({
    data: {
      query: parsed.data,
      requestedById: session?.user?.id ?? null,
    },
  });
  return { ok: true as const };
}
