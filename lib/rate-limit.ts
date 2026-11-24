type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

/** Best-effort in-memory sliding window. Fine for single-instance / warm lambdas. */
export function takeRateLimitToken(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true; remaining: number } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { ok: false, retryAfterSec };
  }

  bucket.timestamps.push(now);

  // Prevent unbounded growth across keys
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      b.timestamps = b.timestamps.filter((t) => t > cutoff);
      if (!b.timestamps.length) buckets.delete(k);
    }
  }

  return { ok: true, remaining: Math.max(0, limit - bucket.timestamps.length) };
}

export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
