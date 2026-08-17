import { notFound } from "next/navigation";
import { SlotForm } from "@/components/business/slot-form";
import { isLocale } from "@/config/app";
export default async function Page({ params }: PageProps<"/[locale]/business-dashboard/slots/new">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <SlotForm locale={locale} />; }
