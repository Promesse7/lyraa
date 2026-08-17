import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import type { Role } from "@/lib/constants";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const providers = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;
      const user = await db.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
      });
      if (!user) return null;
      const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!ok) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role as Role,
        avatarTone: user.avatarTone,
      };
    },
  }),
  // Social login is env-gated: set AUTH_GOOGLE_ID/SECRET to enable.
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    ? [Google]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? "FAN";
        token.username = (user as { username?: string }).username ?? "";
        token.avatarTone =
          (user as { avatarTone?: string }).avatarTone ?? "sage";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.username = token.username as string;
        session.user.avatarTone = token.avatarTone as string;
      }
      return session;
    },
  },
});
