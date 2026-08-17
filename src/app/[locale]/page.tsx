import { notFound } from "next/navigation";

import { HomePage } from "@/components/marketplace/home-page";
import { isLocale } from "@/config/app";
import { getMessages } from "@/messages";

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <HomePage locale={locale} messages={getMessages(locale)} />;
}
