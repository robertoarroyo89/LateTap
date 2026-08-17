import { notFound } from "next/navigation";
import { BusinessProfileEditor } from "@/components/business/business-profile-editor";
import { isLocale } from "@/config/app";
export default async function Page({ params }: PageProps<"/[locale]/business-dashboard/profile">) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <BusinessProfileEditor locale={locale} />; }
