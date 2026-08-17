import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "../auth-form";
import { registerAction } from "../actions";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/discover");

  return (
    <AuthForm
      title="Join the archive."
      subtitle="Create a free account to submit lyrics, vote on annotations and share lyric cards."
      fields={[
        {
          name: "name",
          label: "Name",
          type: "text",
          placeholder: "Keza Amahoro",
          autoComplete: "name",
        },
        {
          name: "username",
          label: "Username",
          type: "text",
          placeholder: "keza.amahoro",
          autoComplete: "username",
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "you@example.rw",
          autoComplete: "email",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "At least 8 characters",
          autoComplete: "new-password",
        },
      ]}
      submitLabel="Tangira — Get started"
      action={registerAction}
      altText="Already have an account?"
      altHref="/login"
      altLabel="Sign in"
    />
  );
}
