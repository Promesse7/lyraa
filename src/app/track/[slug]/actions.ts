"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/rbac";

export async function toggleLineLike(lineId: string) {
  const session = await auth();
  const user = session?.user;
  if (!user || !can(user.role, "comments:create")) {
    return { ok: false as const, error: "signin" as const };
  }
  const existing = await db.lineLike.findUnique({
    where: { userId_lineId: { userId: user.id, lineId } },
  });
  if (existing) {
    await db.$transaction([
      db.lineLike.delete({
        where: { userId_lineId: { userId: user.id, lineId } },
      }),
      db.lyricLine.update({
        where: { id: lineId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
    return { ok: true as const, liked: false };
  }
  await db.$transaction([
    db.lineLike.create({ data: { userId: user.id, lineId } }),
    db.lyricLine.update({
      where: { id: lineId },
      data: { likesCount: { increment: 1 } },
    }),
  ]);
  return { ok: true as const, liked: true };
}

export async function upvoteAnnotation(annotationId: string) {
  const session = await auth();
  const user = session?.user;
  if (!user || !can(user.role, "annotations:upvote")) {
    return { ok: false as const, error: "signin" as const };
  }
  const existing = await db.annotationUpvote.findUnique({
    where: { userId_annotationId: { userId: user.id, annotationId } },
  });
  if (existing) {
    await db.$transaction([
      db.annotationUpvote.delete({
        where: { userId_annotationId: { userId: user.id, annotationId } },
      }),
      db.annotation.update({
        where: { id: annotationId },
        data: { upvotes: { decrement: 1 } },
      }),
    ]);
    return { ok: true as const, upvoted: false };
  }
  await db.$transaction([
    db.annotationUpvote.create({ data: { userId: user.id, annotationId } }),
    db.annotation.update({
      where: { id: annotationId },
      data: { upvotes: { increment: 1 } },
    }),
  ]);
  return { ok: true as const, upvoted: true };
}

const commentSchema = z.string().trim().min(2).max(500);

export async function addLineComment(
  lineId: string,
  body: string,
  trackSlug: string
) {
  const session = await auth();
  const user = session?.user;
  if (!user || !can(user.role, "comments:create")) {
    return { ok: false as const, error: "signin" as const };
  }
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return { ok: false as const, error: "invalid" as const };
  await db.lineComment.create({
    data: { lineId, userId: user.id, body: parsed.data },
  });
  revalidatePath(`/track/${trackSlug}`);
  return { ok: true as const };
}

export async function getLineComments(lineId: string) {
  const comments = await db.lineComment.findMany({
    where: { lineId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { username: true, name: true, avatarTone: true } },
    },
  });
  return comments.map((c) => ({
    id: c.id,
    body: c.body,
    username: c.user.username,
    avatarTone: c.user.avatarTone,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function getMyLineState(trackId: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) return { likedLineIds: [], upvotedAnnotationIds: [] };
  const [likes, upvotes] = await Promise.all([
    db.lineLike.findMany({
      where: { userId: user.id, line: { trackId } },
      select: { lineId: true },
    }),
    db.annotationUpvote.findMany({
      where: { userId: user.id, annotation: { trackId } },
      select: { annotationId: true },
    }),
  ]);
  return {
    likedLineIds: likes.map((l) => l.lineId),
    upvotedAnnotationIds: upvotes.map((u) => u.annotationId),
  };
}
