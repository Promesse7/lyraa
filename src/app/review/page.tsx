import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/rbac";
import { BackButton } from "@/components/ui/back-button";
import { Eyebrow } from "@/components/ui/primitives";
import { timeAgo } from "@/lib/queries";
import { approveSubmission, rejectSubmission } from "./actions";

export const metadata: Metadata = { title: "Review queue" };

export default async function ReviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!can(session.user.role, "moderation:review")) redirect("/discover");

  const [pending, recent] = await Promise.all([
    db.submission.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { username: true } } },
    }),
    db.submission.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { reviewedAt: "desc" },
      take: 5,
      include: { user: { select: { username: true } } },
    }),
  ]);

  return (
    <main className="flex min-h-dvh flex-col pb-6">
      <div className="flex items-center gap-3 border-b border-divider px-[22px] pt-14 pb-3.5">
        <BackButton />
        <h2 className="flex-1 text-[22px]">Review queue</h2>
        <span className="inline-flex h-7 items-center rounded-full bg-accent-200 px-3 text-xs font-bold text-accent-800">
          {pending.length} pending
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-[22px] pt-4">
        {pending.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-600">
            Queue is clear — nothing waiting for review. 🎉
          </p>
        )}

        {pending.map((submission) => (
          <details
            key={submission.id}
            className="overflow-hidden rounded-[22px] bg-neutral-100 shadow-sm"
          >
            <summary className="cursor-pointer list-none px-4 py-3.5">
              <div className="text-[15px] font-bold">
                {submission.title}{" "}
                <span className="font-semibold text-neutral-600">
                  — {submission.artistName}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-neutral-600">
                {submission.genre} · by @{submission.user.username} ·{" "}
                {timeAgo(submission.createdAt)} ago
              </div>
            </summary>
            <div className="border-t border-divider px-4 py-3">
              <pre className="mb-3 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-bg px-3.5 py-3 font-body text-[13.5px] leading-[1.6]">
                {submission.body}
              </pre>
              <div className="flex flex-col gap-2">
                <form action={approveSubmission}>
                  <input type="hidden" name="id" value={submission.id} />
                  <button
                    type="submit"
                    className="flex h-11 w-full items-center justify-center rounded-full bg-sage-600 font-heading text-sm text-white hover:bg-sage-700"
                  >
                    Approve &amp; publish (+40 pts to contributor)
                  </button>
                </form>
                <form action={rejectSubmission} className="flex gap-2">
                  <input type="hidden" name="id" value={submission.id} />
                  <input
                    name="note"
                    placeholder="Reason (optional)"
                    className="h-11 min-w-0 flex-1 rounded-full border border-neutral-300 bg-bg px-4 text-[13px] placeholder:text-neutral-500 focus-visible:border-accent focus-visible:outline-offset-0"
                  />
                  <button
                    type="submit"
                    className="h-11 shrink-0 rounded-full border-[1.5px] border-accent-700 px-4 text-[13px] font-bold text-accent-700 hover:bg-accent-100"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </div>
          </details>
        ))}

        {recent.length > 0 && (
          <>
            <div className="mt-3">
              <Eyebrow>Recently reviewed</Eyebrow>
            </div>
            {recent.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between rounded-2xl bg-neutral-100 px-4 py-3"
              >
                <div>
                  <div className="text-sm font-bold">
                    {submission.title} — {submission.artistName}
                  </div>
                  <div className="text-xs text-neutral-600">
                    by @{submission.user.username}
                  </div>
                </div>
                <span
                  className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-bold ${
                    submission.status === "APPROVED"
                      ? "bg-sage-200 text-sage-800"
                      : "bg-accent-200 text-accent-800"
                  }`}
                >
                  {submission.status === "APPROVED" ? "Published" : "Rejected"}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
