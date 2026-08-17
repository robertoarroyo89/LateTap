import { AppError } from "@/lib/errors";

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const expected = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  if (new URL(origin).origin !== new URL(expected).origin) {
    throw new AppError("FORBIDDEN", "Invalid request origin", 403);
  }
}
