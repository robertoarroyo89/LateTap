import { cookies } from "next/headers";

import { appConfig } from "@/config/app";
import { AppError, errorResponse } from "@/lib/errors";
import { adminAuth } from "@/lib/firebase/admin";
import { sessionSchema } from "@/lib/validation/auth";
import { assertSameOrigin } from "@/server/security/origin";
import { rateLimit, requestIdentity } from "@/server/security/rate-limit";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    rateLimit(`session:${requestIdentity(request)}`, 12, 60_000);
    const { idToken } = sessionSchema.parse(await request.json());
    const claims = await adminAuth().verifyIdToken(idToken);
    if (Date.now() / 1000 - claims.auth_time > 5 * 60) throw new AppError("UNAUTHORIZED", "Recent sign-in required", 401);
    const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn: appConfig.sessionDurationMs });
    const cookieStore = await cookies();
    cookieStore.set(appConfig.sessionCookieName, sessionCookie, {
      maxAge: appConfig.sessionDurationMs / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return Response.json({ data: { status: "authenticated" } });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const cookieStore = await cookies();
    cookieStore.delete(appConfig.sessionCookieName);
    return Response.json({ data: { status: "signed_out" } });
  } catch (error) { return errorResponse(error); }
}
