import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Studio } from "@/components/studio/studio";

export const metadata: Metadata = { title: "Lyric card" };

export default async function CardStudioPage({
  params,
  searchParams,
}: PageProps<"/track/[slug]/card">) {
  const { slug } = await params;
  const { line } = await searchParams;
  const track = await db.track.findUnique({
    where: { slug },
    include: {
      artist: { select: { name: true } },
      lines: {
        orderBy: { order: "asc" },
        select: { id: true, order: true, textRw: true, textEn: true },
      },
    },
  });
  if (!track || track.lines.length === 0) notFound();

  const session = await auth();
  const initialOrder =
    typeof line === "string" && !Number.isNaN(Number(line))
      ? Number(line)
      : null;

  return (
    <Studio
      trackId={track.id}
      trackTitle={track.title}
      artistName={track.artist.name}
      lines={track.lines}
      initialOrder={initialOrder}
      isAuthed={!!session?.user}
    />
  );
}
