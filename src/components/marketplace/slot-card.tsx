import Link from "next/link";
import { CalendarDays, Clock3, MapPin } from "lucide-react";

import type { Locale } from "@/config/app";
import { formatPrice, formatSlotDate, localizedServiceName } from "@/lib/format";
import type { Messages } from "@/messages";
import type { Slot } from "@/types/domain";

const categoryLabels = {
  hair: { es: "PELUQUERÍA", en: "HAIR" }, barber: { es: "BARBERÍA", en: "BARBER" }, nails: { es: "UÑAS", en: "NAILS" }, massage: { es: "MASAJES", en: "MASSAGE" }, beauty: { es: "ESTÉTICA", en: "BEAUTY" }, "brows-lashes": { es: "CEJAS", en: "BROWS" }, physio: { es: "FISIOTERAPIA", en: "PHYSIO" }, wellness: { es: "BIENESTAR", en: "WELLNESS" },
};

export function SlotCard({ slot, locale, messages, tone = "coral" }: { slot: Slot; locale: Locale; messages: Messages; tone?: "coral" | "mint" | "lilac" }) {
  const service = localizedServiceName(slot.serviceSnapshot, locale);
  const date = formatSlotDate(slot.startAt, locale, slot.timezone);
  return (
    <article className="slot-card">
      <Link href={`/${locale}/slot/${slot.id}`} aria-label={`${service}, ${date}`}>
        <div className={`slot-image slot-image-${tone}`}>
          <span className="slot-category">{categoryLabels[slot.categoryId][locale]}</span>
          <span className="slot-relative"><Clock3 size={13} /> {messages.slot.available}</span>
          <div className="slot-image-mark" aria-hidden="true">{service.charAt(0)}</div>
        </div>
        <div className="slot-content">
          <div className="slot-title-row"><div><h3>{service}</h3><p>{slot.businessSnapshot.name}</p></div>{slot.discountPercent > 0 && <span className="discount-badge">−{slot.discountPercent}%</span>}</div>
          <div className="slot-meta"><span><CalendarDays size={15} /> {date}</span><span>{slot.durationMinutes} {messages.slot.minutes}</span></div>
          <div className="slot-meta muted"><span><MapPin size={15} /> {slot.businessSnapshot.neighborhood}</span>{slot.distanceKm !== undefined && <span>{slot.distanceKm < 1 ? `${Math.round(slot.distanceKm * 1000)} m` : `${slot.distanceKm.toFixed(1)} km`}</span>}</div>
          <div className="slot-card-footer"><div className="price-stack"><span>{formatPrice(slot.regularPriceCents, slot.currency, locale)}</span><strong>{formatPrice(slot.priceCents, slot.currency, locale)}</strong></div><span className="card-reserve-button">{messages.slot.reserve}</span></div>
        </div>
      </Link>
    </article>
  );
}
