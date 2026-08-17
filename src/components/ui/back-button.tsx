"use client";

import { useRouter } from "next/navigation";
import { BackIcon } from "./icons";

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={() => router.back()}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full -ml-2.5 hover:bg-neutral-200/60 ${className}`}
    >
      <BackIcon size={20} />
    </button>
  );
}
