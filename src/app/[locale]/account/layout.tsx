import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/config/app";
import { AccountNav } from "@/components/account/account-nav";
import { authenticateRequest } from "@/server/auth/session";

export const metadata = { robots: { index: false } };
export default async function Layout({ params, children }: LayoutProps<"/[locale]/account">) {
  const { locale } = await params; if (!isLocale(locale)) notFound(); const user = await authenticateRequest().catch(() => null); if (!user) redirect(`/${locale}/login?returnTo=/${locale}/account/bookings`); return <><AccountNav locale={locale} />{children}</>;
}
