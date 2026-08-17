import { AppError } from "@/lib/errors";

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const requestOrigin = new URL(request.url).origin;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  const forwardedOrigin = host ? `${protocol}://${host}` : requestOrigin;
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : requestOrigin;
  if (![requestOrigin, forwardedOrigin, configuredOrigin].includes(new URL(origin).origin)) {
    throw new AppError("FORBIDDEN", "Invalid request origin", 403);
  }
}
