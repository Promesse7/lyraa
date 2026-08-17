import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/constants";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      username: string;
      avatarTone: string;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    role?: Role;
    avatarTone?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    username?: string;
    avatarTone?: string;
  }
}
