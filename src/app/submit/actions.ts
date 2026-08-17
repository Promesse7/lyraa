"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/rbac";
import { GENRES } from "@/lib/constants";
import { parseSubmissionBody } from "@/lib/submissions";

const submissionSchema = z.object({
  title: z.string().trim().min(1, "Give the song a title").max(255),
  artistName: z.string().trim().min(1, "Who performs it?").max(255),
  genre: z.enum(GENRES),
  body: z
    .string()
    .trim()
    .min(20, "Add at least a few lines of lyrics")
    .max(20_000),
});

export async function submitLyricsAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const session = await auth();
  const user = session?.user;
  if (!user || !can(user.role, "lyrics:submit")) {
    return { error: "Sign in to submit lyrics" };
  }

  const parsed = submissionSchema.safeParse({
    title: formData.get("title"),
    artistName: formData.get("artistName"),
    genre: formData.get("genre"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form" };
  }

  if (parseSubmissionBody(parsed.data.body).length === 0) {
    return { error: "We couldn't find any lyric lines in your text" };
  }

  await db.submission.create({
    data: { userId: user.id, ...parsed.data },
  });
  return { ok: true };
}
