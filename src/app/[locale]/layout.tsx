import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { appConfig, isLocale } from "@/config/app";
import { getMessages } from "@/messages";
import "../globals.css";

export async function generateStaticParams() { return appConfig.locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const english = locale === "en";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    title: { default: english ? "LateTap — Last-minute appointments near you" : "LateTap — Citas de última hora cerca de ti", template: "%s | LateTap" },
    description: english ? "Discover appointments that just opened up near you and book in seconds." : "Descubre citas que acaban de quedar libres cerca de ti y reserva en segundos.",
    alternates: { languages: { es: "/es", en: "/en" } },
    openGraph: { type: "website", locale: english ? "en_GB" : "es_ES", siteName: "LateTap", title: english ? "LateTap — Last minute. Right on time." : "LateTap — De última hora. Justo a tiempo.", description: english ? "Discover appointments that just opened up near you." : "Descubre citas que acaban de quedar libres cerca de ti.", images: [{ url: "/og.png", width: 1712, height: 909, alt: "LateTap — Last minute. Right on time." }] },
    twitter: { card: "summary_large_image", title: english ? "LateTap — Last minute. Right on time." : "LateTap — De última hora. Justo a tiempo.", description: english ? "Discover appointments that just opened up near you." : "Descubre citas que acaban de quedar libres cerca de ti.", images: ["/og.png"] },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const messages = getMessages(value);
  return (
    <html lang={value} data-scroll-behavior="smooth" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body><SiteHeader locale={value} messages={messages} /><main>{children}</main><SiteFooter locale={value} messages={messages} /></body>
    </html>
  );
}
