import { notFound, redirect } from "next/navigation";

import { DashboardShell } from "@/components/business/dashboard-shell";
import { isLocale } from "@/config/app";
import { authenticateRequest } from "@/server/auth/session";

export const metadata = { robots: { index: false } };
export default async function Layout({ params, children }: LayoutProps<"/[locale]/business-dashboard">) { const { locale } = await params; if (!isLocale(locale)) notFound(); const user = await authenticateRequest().catch(() => null); if (!user) redirect(`/${locale}/login?returnTo=/${locale}/business-dashboard`); return <DashboardShell locale={locale}>{children}</DashboardShell>; }
