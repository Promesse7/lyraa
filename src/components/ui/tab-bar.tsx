"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, ChatIcon, UserIcon } from "./icons";

const tabs = [
  { href: "/discover", label: "Home", icon: HomeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/feed", label: "Feed", icon: ChatIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
] as const;

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-30 flex border-t border-divider bg-neutral-100 px-2.5 pt-2 pb-[max(env(safe-area-inset-bottom),14px)]"
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href || (href !== "/discover" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-12 flex-1 flex-col items-center justify-center gap-[3px] ${
              active ? "text-accent" : "text-neutral-600"
            }`}
          >
            <Icon size={22} />
            <span
              className={`text-[10px] ${active ? "font-bold" : "font-semibold"}`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
