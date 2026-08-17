import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/rbac";
import { signOutAction } from "@/app/(auth)/actions";
import { Avatar, Eyebrow } from "@/components/ui/primitives";
import {
  ChevronRightIcon,
  LogoutIcon,
  MusicIcon,
  PlusIcon,
} from "@/components/ui/icons";
import { timeAgo } from "@/lib/queries";

export const metadata: Metadata = { title: "Profile" };

const roleLabels: Record<string, string> = {
  FAN: "Contributor",
  ARTIST: "Verified artist",
  EDITOR: "Cultural editor",
  ADMIN: "Admin",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-neutral-200 text-neutral-700",
  APPROVED: "bg-sage-200 text-sage-800",
  REJECTED: "bg-accent-200 text-accent-800",
};

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white">
          <MusicIcon size={28} />
        </div>
        <h2 className="text-[26px]">Join Lyraa</h2>
        <p className="text-[14.5px] leading-normal text-neutral-700">
          Create a free account to submit lyrics, like lines, post lyric cards
          and earn contributor points.
        </p>
        <Link
          href="/register"
          className="flex h-13 w-full items-center justify-center rounded-full bg-accent font-heading text-base text-white"
        >
          Tangira — Get started
        </Link>
        <Link href="/login" className="text-[13.5px] font-bold text-accent">
          I already have an account
        </Link>
      </main>
    );
  }

  const [dbUser, submissions, cardCount] = await Promise.all([
    db.user.findUnique({ where: { id: user.id } }),
    db.submission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.lyricCard.count({ where: { userId: user.id } }),
  ]);

  return (
    <main className="flex flex-1 flex-col pb-4">
      <div className="flex items-center gap-4 px-[22px] pt-14">
        <Avatar
          initials={(user.name ?? "?")
            .split(/\s+/)
            .map((p) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
          size={64}
          tone={(user.avatarTone as "sage" | "accent" | "neutral") ?? "sage"}
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl">{user.name}</h2>
          <div className="text-[13px] text-neutral-600">@{user.username}</div>
        </div>
      </div>

      <div className="mt-3.5 flex gap-2 px-[22px]">
        <span className="inline-flex h-7 items-center rounded-full bg-neutral-200 px-3 text-xs font-bold">
          {roleLabels[user.role] ?? user.role}
        </span>
        <span className="inline-flex h-7 items-center rounded-full bg-sage-200 px-3 text-xs font-bold text-sage-800">
          {dbUser?.points ?? 0} pts
        </span>
        <span className="inline-flex h-7 items-center rounded-full bg-accent-200 px-3 text-xs font-bold text-accent-800">
          {cardCount} cards
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-[22px] pt-5">
        <Link
          href="/submit"
          className="flex h-13 items-center justify-center gap-2 rounded-full bg-accent font-heading text-[15px] text-white hover:bg-accent-600"
        >
          <PlusIcon size={17} />
          Submit lyrics · earn points
        </Link>

        {can(user.role, "moderation:review") && (
          <Link
            href="/review"
            className="flex min-h-13 items-center justify-between rounded-2xl bg-sage-100 px-4 py-3"
          >
            <div>
              <div className="text-sm font-bold text-sage-800">
                Editor review queue
              </div>
              <div className="text-xs text-sage-700">
                Approve or reject pending submissions
              </div>
            </div>
            <ChevronRightIcon size={16} className="text-sage-700" />
          </Link>
        )}

        <div className="mt-2">
          <Eyebrow>My submissions</Eyebrow>
        </div>
        {submissions.length === 0 && (
          <p className="text-[13px] text-neutral-600">
            Nothing yet — submit your first lyrics and help the archive grow.
          </p>
        )}
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="flex items-center justify-between rounded-2xl bg-neutral-100 px-4 py-3"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">
                {submission.title} — {submission.artistName}
              </div>
              <div className="text-xs text-neutral-600">
                {timeAgo(submission.createdAt)} ago
                {submission.reviewNote ? ` · “${submission.reviewNote}”` : ""}
              </div>
            </div>
            <span
              className={`ml-2 inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[11px] font-bold ${
                statusStyles[submission.status]
              }`}
            >
              {submission.status === "PENDING"
                ? "In review"
                : submission.status === "APPROVED"
                  ? "Published"
                  : "Rejected"}
            </span>
          </div>
        ))}

        <form action={signOutAction} className="mt-auto pt-4">
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-neutral-400 font-heading text-[15px] hover:bg-neutral-200/60"
          >
            <LogoutIcon size={17} />
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
