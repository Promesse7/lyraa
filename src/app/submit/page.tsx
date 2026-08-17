import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = { title: "Submit lyrics" };

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const artists = await db.artist.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });

  return <SubmitForm artistNames={artists.map((a) => a.name)} />;
}
