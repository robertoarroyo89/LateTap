import { notFound } from "next/navigation";
import { SlotManager } from "@/components/business/slot-manager";
import { isLocale } from "@/config/app";
export default async function Page({ params }: PageProps<"/[locale]/business-dashboard/slots">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <SlotManager locale={locale} />; }
