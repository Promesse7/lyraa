"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/rbac";
import { SUBMISSION_POINTS } from "@/lib/constants";
import { parseSubmissionBody, slugify } from "@/lib/submissions";

const COVER_GRADIENTS = [
  "radial-gradient(circle at 30% 30%, #f6a06b, #8c491a)",
  "radial-gradient(circle at 70% 30%, #aebf92, #3d472b)",
  "radial-gradient(circle at 30% 70%, #c0b6a5, #474238)",
  "radial-gradient(circle at 70% 70%, #ccdbb2, #56633f)",
];

async function requireEditor() {
  const session = await auth();
  const user = session?.user;
  if (!user || !can(user.role, "moderation:review")) return null;
  return user;
}

export async function approveSubmission(formData: FormData) {
  const user = await requireEditor();
  if (!user) return;
  const id = String(formData.get("id") ?? "");
  const submission = await db.submission.findUnique({ where: { id } });
  if (!submission || submission.status !== "PENDING") return;

  const sections = parseSubmissionBody(submission.body);
  if (sections.length === 0) return;

  // find-or-create the artist by exact name
  let artist = await db.artist.findFirst({
    where: { name: submission.artistName },
  });
  if (!artist) {
    const base = slugify(submission.artistName) || "artist";
    let slug = base;
    for (let n = 2; await db.artist.findUnique({ where: { slug } }); n++) {
      slug = `${base}-${n}`;
    }
    artist = await db.artist.create({
      data: {
        slug,
        name: submission.artistName,
        genres: submission.genre,
        avatarGradient:
          COVER_GRADIENTS[submission.artistName.length % COVER_GRADIENTS.length],
      },
    });
  }

  const base = slugify(submission.title) || "track";
  let slug = base;
  for (let n = 2; await db.track.findUnique({ where: { slug } }); n++) {
    slug = `${base}-${n}`;
  }

  await db.$transaction(async (tx) => {
    const track = await tx.track.create({
      data: {
        slug,
        title: submission.title,
        artistId: artist.id,
        genre: submission.genre,
        coverGradient:
          COVER_GRADIENTS[submission.title.length % COVER_GRADIENTS.length],
        verification: "EDITOR_APPROVED",
      },
    });
    let order = 0;
    for (const [sectionIndex, section] of sections.entries()) {
      const created = await tx.lyricSection.create({
        data: { trackId: track.id, label: section.label, order: sectionIndex + 1 },
      });
      for (const line of section.lines) {
        order += 1;
        await tx.lyricLine.create({
          data: {
            trackId: track.id,
            sectionId: created.id,
            order,
            textRw: line,
          },
        });
      }
    }
    await tx.submission.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewerId: user.id,
        reviewedAt: new Date(),
      },
    });
    await tx.user.update({
      where: { id: submission.userId },
      data: { points: { increment: SUBMISSION_POINTS } },
    });
  });

  revalidatePath("/review");
  revalidatePath("/discover");
}

export async function rejectSubmission(formData: FormData) {
  const user = await requireEditor();
  if (!user) return;
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  const submission = await db.submission.findUnique({ where: { id } });
  if (!submission || submission.status !== "PENDING") return;

  await db.submission.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewNote: note,
      reviewerId: user.id,
      reviewedAt: new Date(),
    },
  });
  revalidatePath("/review");
}
