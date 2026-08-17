/**
 * Sliding-window rate limiter (spec §6: 100 req/min public endpoints).
 * In-memory store for the single-node deploy; the `RateLimitStore`
 * interface is the seam for a Redis-backed store in multi-node production.
 */
export interface RateLimitStore {
  /** Append `now` and return timestamps within [now - windowMs, now]. */
  hit(key: string, now: number, windowMs: number): number[];
}

export class MemoryStore implements RateLimitStore {
  private buckets = new Map<string, number[]>();

  hit(key: string, now: number, windowMs: number): number[] {
    const cutoff = now - windowMs;
    const timestamps = (this.buckets.get(key) ?? []).filter((t) => t > cutoff);
    timestamps.push(now);
    this.buckets.set(key, timestamps);
    // opportunistic GC so idle keys don't leak
    if (this.buckets.size > 10_000) {
      for (const [k, v] of this.buckets) {
        if (v.every((t) => t <= cutoff)) this.buckets.delete(k);
      }
    }
    return timestamps;
  }
}

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** epoch seconds when the oldest hit leaves the window */
  reset: number;
};

export function checkRateLimit(
  store: RateLimitStore,
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): RateLimitResult {
  const hits = store.hit(key, now, windowMs);
  const allowed = hits.length <= limit;
  return {
    allowed,
    limit,
    remaining: Math.max(0, limit - hits.length),
    reset: Math.ceil((hits[0] + windowMs) / 1000),
  };
}

// module-level singleton survives across route invocations in one process
const globalStore = globalThis as unknown as { rateLimitStore?: MemoryStore };
export const rateLimitStore =
  globalStore.rateLimitStore ?? (globalStore.rateLimitStore = new MemoryStore());
