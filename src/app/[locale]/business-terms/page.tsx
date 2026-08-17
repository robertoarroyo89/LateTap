import { notFound } from "next/navigation"; import { LegalPage } from "@/components/legal/legal-page"; import { isLocale } from "@/config/app";
export default async function Page({ params }: PageProps<"/[locale]/business-terms">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <LegalPage locale={locale} type="business-terms" />; }
