"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow } from "./actions";

export function FollowButton({
  artistId,
  slug,
  initiallyFollowing,
  isAuthed,
}: {
  artistId: string;
  slug: string;
  initiallyFollowing: boolean;
  isAuthed: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initiallyFollowing);
  const [pending, startTransition] = useTransition();

  function toggle() {
    if (!isAuthed) {
      router.push("/login");
      return;
    }
    setFollowing((v) => !v);
    startTransition(async () => {
      const res = await toggleFollow(artistId, slug);
      if (!res.ok) {
        setFollowing(initiallyFollowing);
        router.push("/login");
      }
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={toggle}
      className={`flex min-h-12 w-full items-center justify-center gap-1.5 rounded-full font-heading text-[15px] disabled:opacity-45 ${
        following
          ? "border-[1.5px] border-sage-600 bg-sage-100 text-sage-800"
          : "bg-accent text-white hover:bg-accent-600"
      }`}
    >
      {following ? "Following" : "Follow artist"}
    </button>
  );
}
