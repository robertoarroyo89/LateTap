import { notFound } from "next/navigation";
import { ProfileForm } from "@/components/account/profile-form";
import { isLocale } from "@/config/app";
export default async function Page({ params }: PageProps<"/[locale]/account/profile">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <div className="account-page shell"><header className="page-intro"><p className="kicker">ACCOUNT</p><h1>{locale === "es" ? "Tu perfil" : "Your profile"}</h1></header><ProfileForm locale={locale} /></div>; }
