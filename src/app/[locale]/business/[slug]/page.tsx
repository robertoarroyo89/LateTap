import { AtSign, BadgeCheck, Globe2, MapPin, Phone } from "lucide-react";
import { notFound } from "next/navigation";

import { SlotCard } from "@/components/marketplace/slot-card";
import { AvailabilityAlertButton } from "@/components/marketplace/availability-alert-button";
import { CustomerBusinessActions } from "@/components/account/business-actions";
import { isLocale } from "@/config/app";
import { formatPrice, localizedServiceName } from "@/lib/format";
import { getMessages } from "@/messages";
import { getPublicBusinessBySlug } from "@/server/repositories/business-repository";

export default async function BusinessPage({ params }: PageProps<"/[locale]/business/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const data = await getPublicBusinessBySlug(slug);
  if (!data) notFound();
  const { business, services, slots } = data;
  const messages = getMessages(locale);
  return <div className="business-page"><div className="business-cover"><span>{business.name.charAt(0)}</span></div><div className="shell business-profile"><div className="business-title"><div><p className="kicker">{business.address.neighborhood ?? business.address.city}</p><h1>{business.name}</h1>{business.verified && <span className="verified"><BadgeCheck size={17} />{messages.business.verified}</span>}</div><div className="business-actions">{business.phone && <a href={`tel:${business.phone}`}><Phone size={17} />{messages.business.contact}</a>}<a href={`https://www.google.com/maps/search/?api=1&query=${business.location.latitude},${business.location.longitude}`} target="_blank" rel="noreferrer"><MapPin size={17} />{messages.business.directions}</a></div></div><CustomerBusinessActions businessId={business.id} locale={locale} /><p className="business-description">{locale === "en" && business.descriptionEn ? business.descriptionEn : business.descriptionEs}</p>{(business.website || business.instagram) && <div className="social-links">{business.website && <a href={business.website}><Globe2 size={16} />Website</a>}{business.instagram && <a href={`https://instagram.com/${business.instagram}`}><AtSign size={16} />Instagram</a>}</div>}<section><h2>{messages.business.services}</h2><div className="services-list">{services.map((service) => <div key={service.id}><span><strong>{localizedServiceName(service, locale)}</strong><small>{service.durationMinutes} min</small></span><b>{formatPrice(service.regularPriceCents, service.currency, locale)}</b></div>)}</div></section><section><h2>{messages.business.nextSlots}</h2>{slots.length ? <div className="slot-grid">{slots.map((slot, index) => <SlotCard slot={slot} locale={locale} messages={messages} key={slot.id} tone={index % 2 ? "mint" : "coral"} />)}</div> : <div className="market-empty"><h3>{messages.business.noSlots}</h3><AvailabilityAlertButton locale={locale} initialCategoryId={business.primaryCategoryId} businessId={business.id} /></div>}</section></div></div>;
}
