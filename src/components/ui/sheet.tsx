"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Bottom sheet (design screen 05): dimmed backdrop, rounded top, drag handle.
 * Rendered inside the app shell so it stays phone-width on desktop.
 */
export function Sheet({
  open,
  onClose,
  children,
  top = "26%",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** distance from shell top where the sheet begins */
  top?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fade-enter fixed inset-0 z-40 mx-auto w-full max-w-[430px]">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 w-full bg-neutral-900/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="sheet-enter absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[28px] bg-bg px-6 pt-3.5 pb-[max(env(safe-area-inset-bottom),28px)] shadow-lg"
        style={{ top }}
      >
        <div
          aria-hidden
          className="mx-auto mb-4 h-[5px] w-10 shrink-0 rounded-full bg-neutral-300"
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
