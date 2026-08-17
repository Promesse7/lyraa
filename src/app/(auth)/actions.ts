"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username needs at least 3 characters")
    .max(30)
    .regex(/^[a-z0-9._]+$/, "Letters, numbers, dots and underscores only"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password needs at least 8 characters").max(128),
});

export async function registerAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  }
  const { name, username, email, password } = parsed.data;

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (existing) {
    return {
      error:
        existing.email === email
          ? "That email is already registered — try signing in"
          : "That username is taken",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const tones = ["sage", "accent", "neutral"] as const;
  await db.user.create({
    data: {
      name,
      username,
      email,
      passwordHash,
      role: "FAN",
      avatarTone: tones[Math.floor(Math.random() * tones.length)],
    },
  });

  await signIn("credentials", { email, password, redirectTo: "/discover" });
  return {};
}

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").toLowerCase(),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/discover",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Wrong email or password" };
    }
    throw error; // NEXT_REDIRECT on success
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
  redirect("/");
}
