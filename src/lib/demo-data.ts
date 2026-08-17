import { geohashForLocation } from "geofire-common";

import type { PublicBusiness, Slot } from "@/types/domain";

function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

const businesses: PublicBusiness[] = [
  {
    id: "demo-norte-barber",
    name: "Norte Barber Club",
    slug: "norte-barber-club",
    status: "approved",
    primaryCategoryId: "barber",
    categoryIds: ["barber"],
    descriptionEs: "Barbería contemporánea con atención cercana en el corazón de Ruzafa.",
    descriptionEn: "A contemporary neighbourhood barber in the heart of Ruzafa.",
    phone: "+34960000001",
    address: { street: "Zona Ruzafa", number: "", postalCode: "46006", city: "Valencia", region: "Valencia", country: "España", countryCode: "ES", neighborhood: "Ruzafa" },
    location: { latitude: 39.4594, longitude: -0.3732 },
    geohash: geohashForLocation([39.4594, -0.3732]),
    timezone: "Europe/Madrid",
    currency: "EUR",
    verified: true,
    showExactAddress: false,
  },
  {
    id: "demo-calma-massage",
    name: "Calma Massage",
    slug: "calma-massage",
    status: "approved",
    primaryCategoryId: "massage",
    categoryIds: ["massage", "wellness"],
    descriptionEs: "Masajes para bajar el ritmo, recuperar energía y volver a tu día.",
    descriptionEn: "Massage sessions to slow down, recover and get back to your day.",
    whatsapp: "+34600000002",
    address: { street: "Zona El Carmen", number: "", postalCode: "46003", city: "Valencia", region: "Valencia", country: "España", countryCode: "ES", neighborhood: "El Carmen" },
    location: { latitude: 39.4784, longitude: -0.3802 },
    geohash: geohashForLocation([39.4784, -0.3802]),
    timezone: "Europe/Madrid",
    currency: "EUR",
    verified: true,
    showExactAddress: false,
  },
  {
    id: "demo-aura-nails",
    name: "Aura Nails",
    slug: "aura-nails",
    status: "approved",
    primaryCategoryId: "nails",
    categoryIds: ["nails", "beauty"],
    descriptionEs: "Un estudio pequeño, cuidado y luminoso dedicado a manos y uñas.",
    descriptionEn: "A bright, thoughtful studio devoted to hands and nails.",
    instagram: "auranails.demo",
    address: { street: "Zona Extramurs", number: "", postalCode: "46008", city: "Valencia", region: "Valencia", country: "España", countryCode: "ES", neighborhood: "Extramurs" },
    location: { latitude: 39.4708, longitude: -0.3917 },
    geohash: geohashForLocation([39.4708, -0.3917]),
    timezone: "Europe/Madrid",
    currency: "EUR",
    verified: true,
    showExactAddress: false,
  },
];

function slot(input: { id: string; business: PublicBusiness; serviceId: string; categoryId: Slot["categoryId"]; nameEs: string; nameEn: string; hours: number; duration: number; regular: number; price: number }): Slot {
  const startAt = hoursFromNow(input.hours);
  const endAt = new Date(new Date(startAt).getTime() + input.duration * 60 * 1000).toISOString();
  return {
    id: input.id,
    businessId: input.business.id,
    serviceId: input.serviceId,
    categoryId: input.categoryId,
    status: "published",
    startAt,
    endAt,
    timezone: input.business.timezone,
    durationMinutes: input.duration,
    regularPriceCents: input.regular,
    priceCents: input.price,
    currency: "EUR",
    discountPercent: Math.round((1 - input.price / input.regular) * 100),
    location: input.business.location,
    geohash: input.business.geohash,
    cityKey: "valencia",
    businessSnapshot: { name: input.business.name, slug: input.business.slug, neighborhood: input.business.address.neighborhood ?? "Valencia", city: "Valencia" },
    serviceSnapshot: { nameEs: input.nameEs, nameEn: input.nameEn, categoryId: input.categoryId },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const demoBusinesses = businesses;
export const demoSlots: Slot[] = [
  slot({ id: "demo-slot-cut", business: businesses[0], serviceId: "demo-service-cut", categoryId: "barber", nameEs: "Corte + barba", nameEn: "Haircut + beard", hours: 2, duration: 45, regular: 3000, price: 2200 }),
  slot({ id: "demo-slot-massage", business: businesses[1], serviceId: "demo-service-massage", categoryId: "massage", nameEs: "Masaje relajante", nameEn: "Relaxing massage", hours: 3, duration: 60, regular: 4800, price: 3600 }),
  slot({ id: "demo-slot-nails", business: businesses[2], serviceId: "demo-service-nails", categoryId: "nails", nameEs: "Manicura semipermanente", nameEn: "Gel manicure", hours: 4, duration: 40, regular: 2800, price: 2100 }),
  slot({ id: "demo-slot-beard", business: businesses[0], serviceId: "demo-service-beard", categoryId: "barber", nameEs: "Arreglo de barba", nameEn: "Beard trim", hours: 26, duration: 30, regular: 1800, price: 1500 }),
  slot({ id: "demo-slot-deep-massage", business: businesses[1], serviceId: "demo-service-deep", categoryId: "massage", nameEs: "Masaje descontracturante", nameEn: "Deep tissue massage", hours: 28, duration: 60, regular: 5500, price: 4200 }),
];
