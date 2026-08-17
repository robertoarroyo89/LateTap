import { AppError } from "@/lib/errors";

type Counter = { count: number; resetAt: number };
const counters = new Map<string, Counter>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = counters.get(key);
  if (!current || current.resetAt <= now) {
    counters.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (current.count >= limit) throw new AppError("RATE_LIMITED", "Too many requests", 429);
  current.count += 1;
}

export function requestIdentity(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}
