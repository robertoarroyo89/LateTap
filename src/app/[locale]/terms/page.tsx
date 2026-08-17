import { notFound } from "next/navigation"; import { LegalPage } from "@/components/legal/legal-page"; import { isLocale } from "@/config/app";
export default async function Page({ params }: PageProps<"/[locale]/terms">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <LegalPage locale={locale} type="terms" />; }
