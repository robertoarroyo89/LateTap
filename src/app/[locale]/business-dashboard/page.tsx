import { notFound } from "next/navigation";
import { BusinessOverview } from "@/components/business/business-overview";
import { isLocale } from "@/config/app";
export default async function Page({ params }: PageProps<"/[locale]/business-dashboard">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <BusinessOverview locale={locale} />; }
