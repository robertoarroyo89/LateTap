import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";
import { cache } from "react";

import { appConfig } from "@/config/app";
import { AppError } from "@/lib/errors";
import { adminAuth } from "@/lib/firebase/admin";
import type { UserRole } from "@/types/domain";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
  roles: UserRole[];
  admin: boolean;
  claims: DecodedIdToken;
}

function userFromClaims(claims: DecodedIdToken): AuthenticatedUser {
  const roles = Array.isArray(claims.roles)
    ? claims.roles.filter((role): role is UserRole => role === "customer" || role === "businessOwner")
    : ["customer" as const];
  return { uid: claims.uid, email: claims.email, name: claims.name, roles, admin: claims.admin === true, claims };
}

export async function authenticateRequest(request?: Request): Promise<AuthenticatedUser> {
  const authorization = request?.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const claims = await adminAuth().verifyIdToken(authorization.slice(7), true);
    return userFromClaims(claims);
  }
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(appConfig.sessionCookieName)?.value;
  if (!sessionCookie) throw new AppError("UNAUTHORIZED", "Authentication required", 401);
  try {
    return userFromClaims(await adminAuth().verifySessionCookie(sessionCookie, true));
  } catch {
    throw new AppError("UNAUTHORIZED", "Session expired", 401);
  }
}

export const getCurrentUser = cache(async (): Promise<AuthenticatedUser | null> => {
  try {
    return await authenticateRequest();
  } catch {
    return null;
  }
});

export async function requireAdmin(request?: Request) {
  const user = await authenticateRequest(request);
  if (!user.admin) throw new AppError("FORBIDDEN", "Admin access required", 403);
  return user;
}
