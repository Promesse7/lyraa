"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "@/components/ui/icons";

export function SearchBox({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      const q = value.trim();
      router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search", {
        scroll: false,
      });
    }, 250);
    return () => clearTimeout(t);
  }, [value, router]);

  return (
    <div className="flex h-12 items-center gap-2.5 rounded-full border-[1.5px] border-accent bg-neutral-100 px-[18px]">
      <SearchIcon size={18} className="shrink-0 text-accent" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search Lyraa"
        aria-label="Search tracks, artists and verses"
        autoComplete="off"
        className="h-full w-full bg-transparent text-[15px] placeholder:text-neutral-500 focus:outline-none"
      />
    </div>
  );
}
