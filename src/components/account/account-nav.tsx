import Link from "next/link";

import type { Locale } from "@/config/app";

export function AccountNav({ locale }: { locale: Locale }) {
  return <nav className="account-nav" aria-label={locale === "es" ? "Mi cuenta" : "My account"}><Link href={`/${locale}/account/bookings`}>{locale === "es" ? "Reservas" : "Bookings"}</Link><Link href={`/${locale}/account/favorites`}>{locale === "es" ? "Favoritos" : "Favorites"}</Link><Link href={`/${locale}/account/alerts`}>{locale === "es" ? "Alertas" : "Alerts"}</Link><Link href={`/${locale}/account/profile`}>{locale === "es" ? "Perfil" : "Profile"}</Link></nav>;
}
