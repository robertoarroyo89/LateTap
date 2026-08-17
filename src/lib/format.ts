import type { Locale } from "@/config/app";

export function formatPrice(cents: number, currency: string, locale: Locale) {
  return new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatSlotDate(iso: string, locale: Locale, timezone: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(date);
}

export function localizedServiceName(service: { nameEs: string; nameEn?: string }, locale: Locale) {
  return locale === "en" && service.nameEn ? service.nameEn : service.nameEs;
}

export function calculateDiscount(regularPriceCents: number, priceCents: number) {
  if (regularPriceCents <= 0 || priceCents <= 0 || priceCents > regularPriceCents) return 0;
  return Math.round(((regularPriceCents - priceCents) / regularPriceCents) * 100);
}
