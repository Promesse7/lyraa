import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { applyRateLimit, corsPreflight } from "@/lib/api";

export async function OPTIONS() {
  return corsPreflight();
}

/**
 * GET /api/v1/tracks/{id}/annotations — approved cultural annotations with
 * their line anchors. Accepts a track id or slug.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/v1/tracks/[id]/annotations">
) {
  const rate = await applyRateLimit(request);
  if (rate.blocked) return rate.blocked;

  const { id } = await params;
  const track = await db.track.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { id: true, slug: true, title: true },
  });
  if (!track) {
    return NextResponse.json(
      { error: "track_not_found" },
      { status: 404, headers: rate.headers }
    );
  }

  const annotations = await db.annotation.findMany({
    where: { trackId: track.id, status: "APPROVED" },
    orderBy: { upvotes: "desc" },
    include: { line: { select: { order: true, textRw: true } } },
  });

  return NextResponse.json(
    {
      data: annotations.map((a) => ({
        id: a.id,
        phrase: a.phrase,
        kind: a.kind,
        literal: a.literal,
        poetic: a.poetic,
        culturalContext: a.culturalContext,
        artistNote: a.artistNote,
        artistNoteBy: a.artistNoteBy,
        annotatedBy: a.annotatedBy,
        upvotes: a.upvotes,
        lineOrder: a.line?.order ?? null,
        lineText: a.line?.textRw ?? null,
      })),
      meta: { track: { id: track.id, slug: track.slug, title: track.title } },
    },
    { headers: rate.headers }
  );
}
