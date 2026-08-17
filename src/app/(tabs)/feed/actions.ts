"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/rbac";

export async function toggleCardLike(cardId: string) {
  const session = await auth();
  const user = session?.user;
  if (!user || !can(user.role, "comments:create")) {
    return { ok: false as const, error: "signin" as const };
  }
  const existing = await db.cardLike.findUnique({
    where: { userId_cardId: { userId: user.id, cardId } },
  });
  if (existing) {
    await db.$transaction([
      db.cardLike.delete({
        where: { userId_cardId: { userId: user.id, cardId } },
      }),
      db.lyricCard.update({
        where: { id: cardId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
    return { ok: true as const, liked: false };
  }
  await db.$transaction([
    db.cardLike.create({ data: { userId: user.id, cardId } }),
    db.lyricCard.update({
      where: { id: cardId },
      data: { likesCount: { increment: 1 } },
    }),
  ]);
  return { ok: true as const, liked: true };
}

const commentSchema = z.string().trim().min(2).max(500);

export async function addCardComment(cardId: string, body: string) {
  const session = await auth();
  const user = session?.user;
  if (!user || !can(user.role, "comments:create")) {
    return { ok: false as const, error: "signin" as const };
  }
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return { ok: false as const, error: "invalid" as const };
  await db.$transaction([
    db.cardComment.create({
      data: { cardId, userId: user.id, body: parsed.data },
    }),
    db.lyricCard.update({
      where: { id: cardId },
      data: { commentsCount: { increment: 1 } },
    }),
  ]);
  return { ok: true as const };
}

export async function getCardComments(cardId: string) {
  const comments = await db.cardComment.findMany({
    where: { cardId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { username: true, avatarTone: true } },
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
