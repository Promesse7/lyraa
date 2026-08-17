import type { Role } from "./constants";

/**
 * RBAC permission scopes (spec §1). Guests (no session) get read-only access
 * enforced by requiring a session before any of these checks even run.
 */
export const PERMISSIONS = [
  "lyrics:submit",
  "lyrics:verify",
  "annotations:create",
  "annotations:approve",
  "annotations:upvote",
  "cards:create",
  "comments:create",
  "artists:follow",
  "artist:notes",
  "moderation:review",
  "admin:manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const FAN_PERMS: Permission[] = [
  "lyrics:submit",
  "annotations:create",
  "annotations:upvote",
  "cards:create",
  "comments:create",
  "artists:follow",
];

const MATRIX: Record<Role, ReadonlySet<Permission>> = {
  FAN: new Set(FAN_PERMS),
  ARTIST: new Set([...FAN_PERMS, "lyrics:verify", "artist:notes"]),
  EDITOR: new Set([
    ...FAN_PERMS,
    "lyrics:verify",
    "annotations:approve",
    "moderation:review",
  ]),
  ADMIN: new Set([
    ...FAN_PERMS,
    "lyrics:verify",
    "artist:notes",
    "annotations:approve",
    "moderation:review",
    "admin:manage",
  ]),
};

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return MATRIX[role]?.has(permission) ?? false;
}

/**
 * Resource-ownership guard (spec §1): users may modify their own resources;
 * editors/admins may moderate anyone's.
 */
export function canModify(
  actor: { id: string; role: Role } | undefined | null,
  resource: { ownerId: string }
): boolean {
  if (!actor) return false;
  if (actor.id === resource.ownerId) return true;
  return actor.role === "EDITOR" || actor.role === "ADMIN";
}
