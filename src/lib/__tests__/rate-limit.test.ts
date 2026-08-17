import { describe, it, expect } from "vitest";
import { MemoryStore, checkRateLimit } from "../rate-limit";

const WINDOW = 60_000;

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const store = new MemoryStore();
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(store, "k", 5, WINDOW, 1000 + i);
      expect(res.allowed).toBe(true);
    }
  });

  it("blocks the request that exceeds the limit", () => {
    const store = new MemoryStore();
    for (let i = 0; i < 3; i++) checkRateLimit(store, "k", 3, WINDOW, 1000 + i);
    const res = checkRateLimit(store, "k", 3, WINDOW, 1004);
    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
  });

  it("slides the window — old hits expire", () => {
    const store = new MemoryStore();
    checkRateLimit(store, "k", 2, WINDOW, 0);
    checkRateLimit(store, "k", 2, WINDOW, 1);
    // both original hits are outside the window now
    const res = checkRateLimit(store, "k", 2, WINDOW, WINDOW + 2);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(1);
  });

  it("tracks keys independently", () => {
    const store = new MemoryStore();
    checkRateLimit(store, "a", 1, WINDOW, 0);
    const blockedA = checkRateLimit(store, "a", 1, WINDOW, 1);
    const freshB = checkRateLimit(store, "b", 1, WINDOW, 1);
    expect(blockedA.allowed).toBe(false);
    expect(freshB.allowed).toBe(true);
  });

  it("reports reset as when the oldest hit leaves the window", () => {
    const store = new MemoryStore();
    const res = checkRateLimit(store, "k", 5, WINDOW, 10_000);
    expect(res.reset).toBe(Math.ceil((10_000 + WINDOW) / 1000));
  });
});
