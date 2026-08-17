"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MusicIcon } from "@/components/ui/icons";

type Field = {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
};

export function AuthForm({
  title,
  subtitle,
  fields,
  submitLabel,
  action,
  altText,
  altHref,
  altLabel,
}: {
  title: string;
  subtitle: string;
  fields: Field[];
  submitLabel: string;
  action: (
    prev: { error?: string } | undefined,
    formData: FormData
  ) => Promise<{ error?: string }>;
  altText: string;
  altHref: string;
  altLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden px-7 pt-16 pb-10">
      <div
        aria-hidden
        className="absolute -top-[90px] -right-[110px] h-[280px] w-[280px] rounded-full bg-accent-200"
      />
      <div
        aria-hidden
        className="absolute top-[70px] right-[34px] h-[120px] w-[120px] rounded-full bg-sage-200"
      />

      <div className="relative flex flex-1 flex-col justify-center gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white">
          <MusicIcon size={26} />
        </div>
        <div>
          <h1 className="text-[34px] leading-[1.08]">{title}</h1>
          <p className="mt-2 text-[15px] text-neutral-700">{subtitle}</p>
        </div>

        <form action={formAction} className="flex flex-col gap-3.5">
          {fields.map((f) => (
            <label key={f.name} className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold">
                {f.label}
              </span>
              <input
                name={f.name}
                type={f.type}
                required
                placeholder={f.placeholder}
                autoComplete={f.autoComplete}
                className="h-12 w-full rounded-full border border-neutral-300 bg-neutral-100 px-[18px] text-[14.5px] placeholder:text-neutral-500 focus-visible:border-accent focus-visible:outline-offset-0"
              />
            </label>
          ))}

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
            className="mt-1 flex h-13 w-full items-center justify-center rounded-full bg-accent font-heading text-base text-white hover:bg-accent-600 active:bg-accent-700 disabled:opacity-45"
          >
            {pending ? "One moment…" : submitLabel}
          </button>
        </form>
      </div>

      <p className="relative mt-6 text-center text-[13.5px] text-neutral-600">
        {altText}{" "}
        <Link
          href={altHref as never}
          className="font-bold text-accent hover:text-accent-700"
        >
          {altLabel}
        </Link>
      </p>
    </main>
  );
}
