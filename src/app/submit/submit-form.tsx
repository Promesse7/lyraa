"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckIcon, CloseIcon, InfoIcon } from "@/components/ui/icons";
import { GENRES, SUBMISSION_POINTS } from "@/lib/constants";
import { submitLyricsAction } from "./actions";

export function SubmitForm({ artistNames }: { artistNames: string[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    submitLyricsAction,
    undefined
  );

  if (state?.ok) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-600 text-white">
          <CheckIcon size={28} />
        </div>
        <h2 className="text-[26px]">Murakoze!</h2>
        <p className="text-[14.5px] leading-normal text-neutral-700">
          Your lyrics are in the review queue. A cultural editor will check the
          orthography — you&apos;ll earn{" "}
          <b className="text-sage-700">+{SUBMISSION_POINTS} pts</b> when they
          publish.
        </p>
        <Link
          href="/profile"
          className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-accent font-heading text-[15px] text-white"
        >
          Track it in your profile
        </Link>
        <Link href="/discover" className="text-[13.5px] font-bold text-accent">
          Back to Discover
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-divider px-[22px] pt-14 pb-3.5">
        <button
          type="button"
          aria-label="Close"
          onClick={() => router.back()}
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-neutral-200/60"
        >
          <CloseIcon size={20} />
        </button>
        <h2 className="flex-1 text-[22px]">Submit lyrics</h2>
        <span className="inline-flex h-7 items-center rounded-full bg-sage-200 px-3 text-xs font-bold text-sage-800">
          +{SUBMISSION_POINTS} pts
        </span>
      </div>

      <form action={formAction} className="flex flex-1 flex-col gap-3.5 px-[22px] pt-[18px] pb-4">
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-bold">Song title</span>
          <input
            name="title"
            required
            placeholder="Impundu"
            className="h-12 w-full rounded-full border border-neutral-300 bg-neutral-100 px-[18px] text-[14.5px] placeholder:text-neutral-500 focus-visible:border-accent focus-visible:outline-offset-0"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-bold">Artist</span>
          <input
            name="artistName"
            required
            list="artist-names"
            placeholder="Kagabo Prince"
            className="h-12 w-full rounded-full border border-neutral-300 bg-neutral-100 px-[18px] text-[14.5px] placeholder:text-neutral-500 focus-visible:border-accent focus-visible:outline-offset-0"
          />
          <datalist id="artist-names">
            {artistNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-bold">Genre</span>
          <select
            name="genre"
            required
            defaultValue=""
            className="h-12 w-full appearance-none rounded-full border border-neutral-300 bg-neutral-100 px-[18px] text-[14.5px] focus-visible:border-accent focus-visible:outline-offset-0"
          >
            <option value="" disabled>
              Pick a genre
            </option>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[12.5px] font-bold">Lyrics (Ikinyarwanda)</span>
            <span className="text-[11px] text-neutral-600">
              Mark sections: [Verse] [Chorus]
            </span>
          </div>
          <textarea
            name="body"
            required
            rows={8}
            placeholder={"[Chorus]\nImpundu zavuze mu gitondo\nUmunsi mwiza waratangiye\n…"}
            className="w-full flex-1 rounded-2xl border border-neutral-300 bg-neutral-100 px-4 py-3.5 text-sm leading-[1.6] text-neutral-800 placeholder:text-neutral-500 focus-visible:border-accent focus-visible:outline-offset-0"
          />
        </div>

        <div className="flex items-start gap-2.5 rounded-2xl bg-sage-100 px-3.5 py-2.5">
          <InfoIcon size={16} className="mt-0.5 shrink-0 text-sage-700" />
          <p className="text-xs leading-normal text-sage-800">
            Follow the <b>Lyraa orthography guide</b>: standard spelling,
            apostrophes for elision (y&apos;umutima), no ALL CAPS. Submissions
            are reviewed by the community before publishing.
          </p>
        </div>

        {state?.error && (
          <p
            role="alert"
            className="rounded-2xl bg-accent-100 px-4 py-2.5 text-[13px] font-semibold text-accent-800"
          >
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mb-2 flex h-13 w-full items-center justify-center rounded-full bg-accent font-heading text-base text-white hover:bg-accent-600 disabled:opacity-45"
        >
          {pending ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </main>
  );
}
