export type ErrorCode =
  | "INVALID_INPUT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "SLOT_NOT_FOUND"
  | "SLOT_ALREADY_RESERVED"
  | "SLOT_EXPIRED"
  | "BUSINESS_NOT_APPROVED"
  | "INVALID_PRICE"
  | "FIREBASE_NOT_CONFIGURED"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(public readonly code: ErrorCode, message: string, public readonly status = 400) {
    super(message);
    this.name = "AppError";
  }
}

export function errorResponse(error: unknown) {
  if (!(error instanceof AppError)) console.error("[api] Unexpected server error", error);
  const known = error instanceof AppError ? error : new AppError("INTERNAL_ERROR", "Unexpected server error", 500);
  return Response.json({ error: { code: known.code, message: known.message } }, { status: known.status });
}
