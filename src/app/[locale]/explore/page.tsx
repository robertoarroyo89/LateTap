import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExploreFilters } from "@/components/marketplace/explore-filters";
import { AvailabilityAlertButton } from "@/components/marketplace/availability-alert-button";
import { SlotCard } from "@/components/marketplace/slot-card";
import { isLocale } from "@/config/app";
import { categories } from "@/config/categories";
import { getMessages } from "@/messages";
import { getSlotRepository } from "@/server/repositories";

export const metadata: Metadata = { title: "Explore", description: "Live last-minute availability near you." };

export default async function ExplorePage({ params, searchParams }: PageProps<"/[locale]/explore">) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const messages = getMessages(locale);
  const category = typeof query.category === "string" && categories.some((item) => item.id === query.category) ? query.category as (typeof categories)[number]["id"] : undefined;
  const date = typeof query.date === "string" ? query.date : "today";
  const from = new Date();
  const to = new Date(from);
  if (date === "today") to.setHours(23, 59, 59, 999); else if (date === "tomorrow") { from.setDate(from.getDate() + 1); from.setHours(0,0,0,0); to.setDate(to.getDate() + 1); to.setHours(23,59,59,999); } else to.setDate(to.getDate() + 7);
  const result = await getSlotRepository().searchPublished({ cityKey: "valencia", categoryId: category, from, to, maxPriceCents: typeof query.maxPrice === "string" ? Number(query.maxPrice) : undefined, latitude: typeof query.lat === "string" ? Number(query.lat) : undefined, longitude: typeof query.lng === "string" ? Number(query.lng) : undefined, radiusKm: typeof query.radius === "string" ? Number(query.radius) : undefined, limit: 20 });
  const latitude = typeof query.lat === "string" ? Number(query.lat) : undefined;
  const longitude = typeof query.lng === "string" ? Number(query.lng) : undefined;
  const datePreference = date === "tomorrow" || date === "week" ? date : "today";
  return (
    <div className="page-shell shell">
      <header className="page-intro"><p className="kicker">{messages.explore.kicker}</p><h1>{messages.explore.title}</h1><p>{messages.explore.subtitle}</p></header>
      <ExploreFilters locale={locale} messages={messages} />
      {result.items.length ? <div className="slot-grid explore-grid">{result.items.map((slot, index) => <SlotCard key={slot.id} slot={slot} locale={locale} messages={messages} tone={index % 3 === 1 ? "mint" : index % 3 === 2 ? "lilac" : "coral"} />)}</div> : <div className="market-empty"><h2>{messages.explore.emptyTitle}</h2><p>{messages.explore.emptyBody}</p><AvailabilityAlertButton locale={locale} initialCategoryId={category} datePreference={datePreference} location={Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude: latitude!, longitude: longitude! } : undefined} radiusKm={typeof query.radius === "string" ? Number(query.radius) : 10} maxPriceCents={typeof query.maxPrice === "string" ? Number(query.maxPrice) : undefined} /></div>}
    </div>
  );
}
