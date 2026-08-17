import Link from "next/link";
import { ArrowRight, HeartPulse, LocateFixed, Scissors, Sparkles, Star } from "lucide-react";

import type { Locale } from "@/config/app";
import { categories } from "@/config/categories";
import type { Messages } from "@/messages";
import { getSlotRepository } from "@/server/repositories";
import { SlotCard } from "@/components/marketplace/slot-card";

const categoryIcons = { hair: Scissors, barber: Scissors, nails: Sparkles, massage: HeartPulse, beauty: Sparkles, "brows-lashes": Star, physio: HeartPulse, wellness: Sparkles };

export async function HomePage({ locale, messages }: { locale: Locale; messages: Messages }) {
  const { items } = await getSlotRepository().searchPublished({ cityKey: "valencia", limit: 6 });
  return (
    <>
      <section className="hero hero-simple">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="live-dot" />{messages.home.live}</div>
            <h1>{messages.home.titleStart}<br /><em>{messages.home.titleEnd}</em></h1>
            <p>{messages.home.subtitle}</p>
            <div className="hero-actions"><Link className="primary-button" href={`/${locale}/explore`}>{messages.home.seeToday}<ArrowRight size={18} /></Link><Link className="secondary-button" href={`/${locale}/explore?location=current`}><LocateFixed size={18} />{messages.home.useLocation}</Link></div>
            <small>{messages.home.venuePayment}</small>
          </div>
          <div className="hero-poster"><span>Something<br />just opened up.</span><strong>Tap<br />and book it.</strong><i>LateTap</i></div>
        </div>
      </section>
      <section className="categories-section"><div className="shell"><div className="section-heading compact-heading"><div><p className="kicker">{messages.home.categoriesKicker}</p><h2>{messages.home.categoriesTitle}</h2></div></div><div className="category-scroller">{categories.map((category) => { const Icon = categoryIcons[category.id]; return <Link className="category-item" href={`/${locale}/explore?category=${category.id}`} key={category.id}><span><Icon size={22} /></span>{locale === "es" ? category.labelEs : category.labelEn}</Link>; })}</div></div></section>
      <section className="slots-section" id="slots"><div className="shell"><div className="section-heading"><div><p className="kicker">{messages.home.upcomingKicker}</p><h2>{messages.home.todayTitle}</h2></div><Link href={`/${locale}/explore`}>{messages.home.all}<ArrowRight size={17} /></Link></div>{items.length ? <div className="slot-grid">{items.slice(0, 3).map((slot, index) => <SlotCard key={slot.id} slot={slot} locale={locale} messages={messages} tone={index === 1 ? "mint" : index === 2 ? "lilac" : "coral"} />)}</div> : <div className="market-empty"><h3>{messages.explore.emptyTitle}</h3><p>{messages.explore.emptyBody}</p></div>}</div></section>
      <section className="business-strip"><div className="shell business-strip-inner"><div><p className="kicker">{messages.home.businessKicker}</p><h2>{messages.home.businessTitle}</h2><p>{messages.home.businessSubtitle}</p></div><Link href={`/${locale}/for-businesses`}>{messages.home.publish}<ArrowRight size={18} /></Link></div></section>
    </>
  );
}
