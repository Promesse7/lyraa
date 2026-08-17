import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MusicIcon } from "@/components/ui/icons";

const genrePills = [
  { label: "Gakondo", cls: "bg-sage-200 text-sage-800" },
  { label: "Kinyatrap", cls: "bg-accent-200 text-accent-800" },
  { label: "Afrobeats", cls: "bg-neutral-200 text-neutral-800" },
  { label: "Gospel", cls: "bg-sage-200 text-sage-800" },
];

export default async function OnboardingPage() {
  const session = await auth();
  if (session?.user) redirect("/discover");

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden px-7 pt-16 pb-12">
      {/* decorative circle motifs */}
      <div
        aria-hidden
        className="absolute -top-[90px] -right-[110px] h-[280px] w-[280px] rounded-full bg-accent-200"
      />
      <div
        aria-hidden
        className="absolute top-[70px] right-[34px] h-[120px] w-[120px] rounded-full bg-sage-200"
      />

      <div className="relative flex flex-1 flex-col justify-center gap-[18px]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white">
          <MusicIcon size={30} />
        </div>
        <h1 className="text-[44px] leading-[1.05]">
          Every line,
          <br />
          every meaning.
        </h1>
        <p className="text-base leading-normal text-neutral-700">
          Rwanda&apos;s living lyric library — read the words, unlock the
          poetry, share the lines you love.
        </p>
        <div className="flex flex-wrap gap-2">
          {genrePills.map(({ label, cls }) => (
            <span
              key={label}
              className={`inline-flex h-[30px] items-center rounded-full px-3.5 text-[13px] font-semibold ${cls}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col gap-3">
        <Link
          href="/register"
          className="flex h-13 items-center justify-center rounded-full bg-accent font-heading text-base text-white hover:bg-accent-600 active:bg-accent-700"
        >
          Tangira — Get started
        </Link>
        <Link
          href="/login"
          className="flex h-13 items-center justify-center rounded-full border-[1.5px] border-neutral-400 font-heading text-base hover:bg-neutral-200/60"
        >
          I already have an account
        </Link>
        <Link
          href="/discover"
          className="mt-1 text-center text-[13px] font-semibold text-neutral-600 hover:text-accent"
        >
          Browse as a guest
        </Link>
      </div>
    </main>
  );
}
