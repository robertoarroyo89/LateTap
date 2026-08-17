import type { Metadata } from "next";
import { ArrowLeft, Clock3, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingButton } from "@/components/booking/booking-button";
import { isLocale } from "@/config/app";
import { formatPrice, formatSlotDate, localizedServiceName } from "@/lib/format";
import { getMessages } from "@/messages";
import { getSlotRepository } from "@/server/repositories";

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default async function SlotPage({ params }: PageProps<"/[locale]/slot/[slotId]">) {
  const { locale, slotId } = await params;
  if (!isLocale(locale)) notFound();
  const [slot, messages] = await Promise.all([getSlotRepository().getPublicById(slotId), Promise.resolve(getMessages(locale))]);
  if (!slot) notFound();
  const available = slot.status === "published" && new Date(slot.startAt) > new Date();
  return (
    <div className="detail-page shell"><Link className="back-link" href={`/${locale}/explore`}><ArrowLeft size={17} />{messages.common.back}</Link>
      <div className="detail-grid"><div className="detail-visual"><span>{localizedServiceName(slot.serviceSnapshot, locale).charAt(0)}</span></div><article className="detail-card"><p className="kicker">{messages.slot.available.toUpperCase()}</p><h1>{localizedServiceName(slot.serviceSnapshot, locale)}</h1><Link className="business-link" href={`/${locale}/business/${slot.businessSnapshot.slug}`}>{slot.businessSnapshot.name}</Link><div className="detail-facts"><span><Clock3 />{formatSlotDate(slot.startAt, locale, slot.timezone)} · {slot.durationMinutes} {messages.slot.minutes}</span><span><MapPin />{slot.businessSnapshot.neighborhood}, {slot.businessSnapshot.city}</span></div><div className="detail-price"><span>{formatPrice(slot.regularPriceCents, slot.currency, locale)}</span><strong>{formatPrice(slot.priceCents, slot.currency, locale)}</strong>{slot.discountPercent > 0 && <b>−{slot.discountPercent}%</b>}</div>{available ? <BookingButton slot={slot} locale={locale} messages={messages} /> : <div className="unavailable"><strong>{new Date(slot.startAt) <= new Date() ? messages.slot.expired : messages.slot.noLongerAvailable}</strong><Link href={`/${locale}/explore`}>{messages.slot.otherNearby}</Link></div>}<p className="venue-note"><ShieldCheck size={18} />{messages.slot.payAtVenue}</p></article></div>
    </div>
  );
}
