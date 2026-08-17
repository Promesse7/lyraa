import { describe, it, expect } from "vitest";
import { can, canModify } from "../rbac";

describe("can (permission matrix)", () => {
  it("denies everything without a role (guest)", () => {
    expect(can(undefined, "lyrics:submit")).toBe(false);
    expect(can(null, "cards:create")).toBe(false);
  });

  it("lets fans submit lyrics, make cards, comment — not moderate", () => {
    expect(can("FAN", "lyrics:submit")).toBe(true);
    expect(can("FAN", "cards:create")).toBe(true);
    expect(can("FAN", "comments:create")).toBe(true);
    expect(can("FAN", "annotations:upvote")).toBe(true);
    expect(can("FAN", "moderation:review")).toBe(false);
    expect(can("FAN", "lyrics:verify")).toBe(false);
    expect(can("FAN", "admin:manage")).toBe(false);
  });

  it("lets artists verify lyrics and post artist notes", () => {
    expect(can("ARTIST", "lyrics:verify")).toBe(true);
    expect(can("ARTIST", "artist:notes")).toBe(true);
    expect(can("ARTIST", "moderation:review")).toBe(false);
  });

  it("lets editors review submissions and approve annotations", () => {
    expect(can("EDITOR", "moderation:review")).toBe(true);
    expect(can("EDITOR", "annotations:approve")).toBe(true);
    expect(can("EDITOR", "admin:manage")).toBe(false);
  });

  it("lets admins do everything", () => {
    expect(can("ADMIN", "admin:manage")).toBe(true);
    expect(can("ADMIN", "moderation:review")).toBe(true);
    expect(can("ADMIN", "lyrics:submit")).toBe(true);
  });
});

describe("canModify (ownership guard)", () => {
  const resource = { ownerId: "u1" };

  it("allows the owner", () => {
    expect(canModify({ id: "u1", role: "FAN" }, resource)).toBe(true);
  });

  it("denies other fans and artists", () => {
    expect(canModify({ id: "u2", role: "FAN" }, resource)).toBe(false);
    expect(canModify({ id: "u2", role: "ARTIST" }, resource)).toBe(false);
  });

  it("allows editors and admins to moderate", () => {
    expect(canModify({ id: "u2", role: "EDITOR" }, resource)).toBe(true);
    expect(canModify({ id: "u2", role: "ADMIN" }, resource)).toBe(true);
  });

  it("denies guests", () => {
    expect(canModify(null, resource)).toBe(false);
  });
});
