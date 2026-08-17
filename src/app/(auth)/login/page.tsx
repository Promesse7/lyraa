import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "../auth-form";
import { loginAction } from "../actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/discover");

  return (
    <AuthForm
      title="Murakaza neza."
      subtitle="Welcome back — sign in to keep annotating, clipping and sharing."
      fields={[
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
          placeholder: "Your password",
          autoComplete: "current-password",
        },
      ]}
      submitLabel="Sign in"
      action={loginAction}
      altText="New to Lyraa?"
      altHref="/register"
      altLabel="Tangira — Get started"
    />
  );
}
