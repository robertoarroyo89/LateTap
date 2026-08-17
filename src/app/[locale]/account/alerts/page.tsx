import { notFound } from "next/navigation";
import { AlertsManager } from "@/components/account/alerts-manager";
import { isLocale } from "@/config/app";
export default async function Page({ params }: PageProps<"/[locale]/account/alerts">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <div className="account-page shell"><header className="page-intro"><p className="kicker">MY LATETAP</p><h1>{locale === "es" ? "Alertas" : "Alerts"}</h1><p>{locale === "es" ? "Te avisaremos cuando aparezca una cita que encaje contigo." : "We'll notify you when a matching appointment opens up."}</p></header><AlertsManager locale={locale} /></div>; }
