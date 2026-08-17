import { notFound } from "next/navigation";
import { ServiceManager } from "@/components/business/service-manager";
import { isLocale } from "@/config/app";
export default async function Page({ params }: PageProps<"/[locale]/business-dashboard/services">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <ServiceManager locale={locale} />; }
