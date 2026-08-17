import Link from "next/link";

import type { Locale } from "@/config/app";
import type { Messages } from "@/messages";

export function SiteFooter({ locale, messages }: { locale: Locale; messages: Messages }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div><Link className="wordmark" href={`/${locale}`}>Late<span>Tap</span></Link><p>Last minute. Right on time.</p></div>
        <nav aria-label="Footer"><Link href={`/${locale}/explore`}>{messages.nav.explore}</Link><Link href={`/${locale}/for-businesses`}>{messages.nav.forBusinesses}</Link><Link href={`/${locale}/how-it-works`}>How it works</Link></nav>
        <nav aria-label="Legal"><Link href={`/${locale}/legal`}>Legal</Link><Link href={`/${locale}/privacy`}>Privacy</Link><Link href={`/${locale}/cookies`}>Cookies</Link></nav>
        <p>© {new Date().getFullYear()} LateTap</p>
      </div>
    </footer>
  );
}
