import Link from "next/link";
import type { ReactNode } from "react";
import { VerifiedBadgeIcon } from "./icons";

/* ————— cover art: gradient discs stand in for album art (design: "washed" radial) ————— */

export function CoverArt({
  gradient,
  size = 44,
  radius = 12,
  className = "",
}: {
  gradient: string;
  size?: number;
  radius?: number | string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`washed shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: gradient,
      }}
    />
  );
}

/* ————— avatar: initials on a tinted disc ————— */

const avatarTones = {
  sage: "bg-sage-300 text-sage-800",
  accent: "bg-accent-300 text-accent-800",
  neutral: "bg-neutral-300 text-neutral-800",
} as const;

export function Avatar({
  initials,
  size = 36,
  tone = "sage",
}: {
  initials: string;
  size?: number;
  tone?: keyof typeof avatarTones;
}) {
  return (
    <div
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${avatarTones[tone]}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </div>
  );
}

/* ————— verification badge on track rows / headers ————— */

export function VerificationBadge({
  status,
}: {
  status: string; // ARTIST_VERIFIED | EDITOR_APPROVED | COMMUNITY
}) {
  if (status === "ARTIST_VERIFIED" || status === "EDITOR_APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sage-700">
        <VerifiedBadgeIcon size={12} color="currentColor" />
        Verified
      </span>
    );
  }
  return (
    <span className="text-[11px] font-semibold text-neutral-500">Community</span>
  );
}

/* ————— genre / filter chip row ————— */

export function Chip({
  active,
  children,
  href,
}: {
  active?: boolean;
  children: ReactNode;
  href?: string;
}) {
  const cls = `inline-flex h-[34px] flex-none items-center rounded-full px-4 text-[13px] font-semibold ${
    active ? "bg-ink text-bg font-bold" : "bg-neutral-200 text-ink"
  }`;
  if (href) {
    return (
      <Link href={href as never} className={cls}>
        {children}
      </Link>
    );
  }
  return <span className={cls}>{children}</span>;
}

/* ————— track list row (screens 02/03/08) ————— */

export function TrackRow({
  href,
  gradient,
  title,
  subtitle,
  right,
}: {
  href: string;
  gradient: string;
  title: ReactNode;
  subtitle: ReactNode;
  right?: ReactNode;
}) {
  return (
    <Link
      href={href as never}
      className="flex min-h-14 items-center gap-3 rounded-2xl bg-neutral-100 px-3 py-2"
    >
      <CoverArt gradient={gradient} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{title}</div>
        <div className="truncate text-xs text-neutral-600">{subtitle}</div>
      </div>
      {right}
    </Link>
  );
}

/* ————— section eyebrow (Caprasimo caps, design h6 style) ————— */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <h6 className="font-heading text-xs font-normal uppercase tracking-[0.08em] text-neutral-600">
      {children}
    </h6>
  );
}

/* ————— primary pill CTA (52px, Caprasimo label) ————— */

export function PillButton({
  children,
  variant = "primary",
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "outline";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const look =
    variant === "primary"
      ? "bg-accent text-white hover:bg-accent-600 active:bg-accent-700"
      : "border-[1.5px] border-neutral-400 text-ink hover:bg-neutral-200/60";
  return (
    <button
      type={type}
      disabled={disabled}
      className={`flex h-13 w-full items-center justify-center gap-2 rounded-full font-heading text-base disabled:opacity-45 ${look} ${className}`}
    >
      {children}
    </button>
  );
}
