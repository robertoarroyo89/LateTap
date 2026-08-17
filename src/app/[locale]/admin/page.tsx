import { notFound, redirect } from "next/navigation";
import { AdminBusinesses } from "@/components/admin/admin-businesses";
import { isLocale } from "@/config/app";
import { requireAdmin } from "@/server/auth/session";
export const metadata = { title: "Admin", robots: { index: false } };
export default async function Page({ params }: PageProps<"/[locale]/admin">) { const { locale } = await params; if (!isLocale(locale)) notFound(); const admin = await requireAdmin().catch(() => null); if (!admin) redirect(`/${locale}/login?returnTo=/${locale}/admin`); return <div className="admin-page shell"><header className="page-intro"><p className="kicker">LATETAP ADMIN</p><h1>{locale === "es" ? "Moderación" : "Moderation"}</h1><p>{locale === "es" ? "Negocios, reportes y configuración del marketplace." : "Businesses, reports and marketplace settings."}</p></header><AdminBusinesses locale={locale} /></div>; }
