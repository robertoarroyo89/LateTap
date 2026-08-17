import Link from "next/link";
import { CalendarDays, ChevronDown, MapPin, Search, Sparkles } from "lucide-react";

import type { Locale } from "@/config/app";
import type { Messages } from "@/messages";

export function SiteHeader({ locale, messages }: { locale: Locale; messages: Messages }) {
  const alternate = locale === "es" ? "en" : "es";
  return (
    <>
      <header className="site-header">
        <div className="shell header-inner">
          <Link className="wordmark" href={`/${locale}`} aria-label="LateTap, home">Late<span>Tap</span><i aria-hidden="true" /></Link>
          <button className="location-button" type="button"><MapPin size={16} strokeWidth={2.4} aria-hidden="true" />{messages.common.nearby}<ChevronDown size={15} aria-hidden="true" /></button>
          <nav className="desktop-nav" aria-label="Primary navigation">
            <Link href={`/${locale}/explore`}>{messages.nav.explore}</Link>
            <Link href={`/${locale}/for-businesses`}>{messages.nav.forBusinesses}</Link>
            <Link className="language-button" href={`/${alternate}`} aria-label={messages.common.language}>{alternate.toUpperCase()}</Link>
            <Link className="login-button" href={`/${locale}/login`}>{messages.nav.login}</Link>
          </nav>
        </div>
      </header>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href={`/${locale}`}><Sparkles size={20} />{messages.nav.home}</Link>
        <Link href={`/${locale}/explore`}><Search size={20} />{messages.nav.explore}</Link>
        <Link href={`/${locale}/account/bookings`}><CalendarDays size={20} />{messages.nav.bookings}</Link>
        <Link href={`/${locale}/account/profile`}><span className="profile-dot" />{messages.nav.profile}</Link>
      </nav>
    </>
  );
}
