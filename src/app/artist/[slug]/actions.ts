"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/rbac";

export async function toggleFollow(artistId: string, slug: string) {
  const session = await auth();
  const user = session?.user;
  if (!user || !can(user.role, "artists:follow")) {
    return { ok: false as const, error: "signin" as const };
  }
  const existing = await db.follow.findUnique({
    where: { userId_artistId: { userId: user.id, artistId } },
  });
  if (existing) {
    await db.$transaction([
      db.follow.delete({
        where: { userId_artistId: { userId: user.id, artistId } },
      }),
      db.artist.update({
        where: { id: artistId },
        data: { followersCount: { decrement: 1 } },
      }),
    ]);
    revalidatePath(`/artist/${slug}`);
    return { ok: true as const, following: false };
  }
  await db.$transaction([
    db.follow.create({ data: { userId: user.id, artistId } }),
    db.artist.update({
      where: { id: artistId },
      data: { followersCount: { increment: 1 } },
    }),
  ]);
  revalidatePath(`/artist/${slug}`);
  return { ok: true as const, following: true };
}
