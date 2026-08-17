export const appConfig = {
  name: "LateTap",
  shortName: "LateTap",
  description: "Last-minute appointments near you.",
  defaultLocale: "es",
  locales: ["es", "en"],
  defaultCity: "valencia",
  defaultCountry: "ES",
  defaultCurrency: "EUR",
  defaultTimezone: "Europe/Madrid",
  bookingPaymentMode: "venue",
  sessionCookieName: "latetap_session",
  sessionDurationMs: 1000 * 60 * 60 * 24 * 5,
  legalVersion: "2026-08-17",
} as const;

export type Locale = (typeof appConfig.locales)[number];

export function isLocale(value: string): value is Locale {
  return appConfig.locales.includes(value as Locale);
}
