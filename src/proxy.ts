import { NextResponse, type NextRequest } from "next/server";

import { appConfig } from "@/config/app";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = appConfig.locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (hasLocale || pathname.startsWith("/api/") || pathname.includes(".")) return NextResponse.next();
  const stored = request.cookies.get("latetap_locale")?.value;
  const preferred = stored && appConfig.locales.includes(stored as "es" | "en")
    ? stored
    : request.headers.get("accept-language")?.toLowerCase().startsWith("en") ? "en" : "es";
  const url = request.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next|api).*)"] };
