import { FieldValue, GeoPoint, Timestamp } from "firebase-admin/firestore";
import { geohashForLocation } from "geofire-common";

import { adminDb } from "@/lib/firebase/admin";

const showcaseBusinesses = [
  { name: "Brava Hair Studio", slug: "brava-hair-studio", categoryId: "hair", serviceEs: "Corte y peinado", serviceEn: "Cut and styling", neighborhood: "Ruzafa", latitude: 39.4594, longitude: -0.3732, duration: 45, regular: 3600 },
  { name: "Norte Barber Club", slug: "norte-barber-club", categoryId: "barber", serviceEs: "Corte + barba", serviceEn: "Haircut + beard", neighborhood: "Centro", latitude: 39.4722, longitude: -0.3768, duration: 45, regular: 3000 },
  { name: "Aura Nails", slug: "aura-nails", categoryId: "nails", serviceEs: "Manicura semipermanente", serviceEn: "Gel manicure", neighborhood: "Extramurs", latitude: 39.471, longitude: -0.391, duration: 40, regular: 2800 },
  { name: "Calma Massage", slug: "calma-massage", categoryId: "massage", serviceEs: "Masaje relajante", serviceEn: "Relaxing massage", neighborhood: "El Carmen", latitude: 39.478, longitude: -0.38, duration: 60, regular: 4800 },
  { name: "Oliva Beauty Lab", slug: "oliva-beauty-lab", categoryId: "beauty", serviceEs: "Tratamiento facial glow", serviceEn: "Glow facial", neighborhood: "Ensanche", latitude: 39.468, longitude: -0.365, duration: 50, regular: 5500 },
  { name: "Marea Wellness", slug: "marea-wellness", categoryId: "wellness", serviceEs: "Ritual de bienestar", serviceEn: "Wellness ritual", neighborhood: "Benimaclet", latitude: 39.486, longitude: -0.359, duration: 60, regular: 6200 },
] as const;

const slotOffsetsInMinutes = [75, 135, 195, 255, 315, 375, 435, 495, 555, 615, 675, 735] as const;

export async function seedShowcaseData() {
  const db = adminDb();
  const now = Date.now();
  const batch = db.batch();

  showcaseBusinesses.forEach((business, businessIndex) => {
    const suffix = String(businessIndex + 1).padStart(2, "0");
    const businessId = `showcase-business-${suffix}`;
    const serviceId = `showcase-service-${suffix}`;
    const geohash = geohashForLocation([business.latitude, business.longitude]);

    batch.set(db.collection("businesses").doc(businessId), {
      id: businessId,
      ownerUid: `showcase-owner-${suffix}`,
      name: business.name,
      slug: business.slug,
      status: "approved",
      primaryCategoryId: business.categoryId,
      categoryIds: [business.categoryId],
      descriptionEs: `${business.name} ofrece citas de última hora en ${business.neighborhood}.`,
      descriptionEn: `${business.name} offers last-minute appointments in ${business.neighborhood}.`,
      email: `showcase-${suffix}@example.com`,
      phone: "+34960000000",
      address: { street: "Zona centro", number: "", postalCode: "46000", city: "", region: "", country: "España", countryCode: "ES", neighborhood: business.neighborhood },
      location: new GeoPoint(business.latitude, business.longitude),
      geohash,
      timezone: "Europe/Madrid",
      currency: "EUR",
      verified: true,
      showExactAddress: false,
      seedDemo: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      approvedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    batch.set(db.collection("services").doc(serviceId), {
      id: serviceId,
      businessId,
      categoryId: business.categoryId,
      nameEs: business.serviceEs,
      nameEn: business.serviceEn,
      regularPriceCents: business.regular,
      currency: "EUR",
      durationMinutes: business.duration,
      active: true,
      seedDemo: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    for (let slotIndex = 0; slotIndex < 2; slotIndex += 1) {
      const flatIndex = businessIndex * 2 + slotIndex;
      const start = new Date(now + slotOffsetsInMinutes[flatIndex] * 60_000);
      const price = Math.round(business.regular * (slotIndex === 0 ? 0.7 : 0.8));
      const slotId = `showcase-slot-${String(flatIndex + 1).padStart(2, "0")}`;

      batch.set(db.collection("slots").doc(slotId), {
        id: slotId,
        businessId,
        serviceId,
        categoryId: business.categoryId,
        status: "published",
        startAt: Timestamp.fromDate(start),
        endAt: Timestamp.fromMillis(start.getTime() + business.duration * 60_000),
        timezone: "Europe/Madrid",
        durationMinutes: business.duration,
        regularPriceCents: business.regular,
        priceCents: price,
        currency: "EUR",
        discountPercent: Math.round((1 - price / business.regular) * 100),
        note: "Cita de muestra",
        location: new GeoPoint(business.latitude, business.longitude),
        geohash,
        cityKey: "valencia",
        businessSnapshot: { name: business.name, slug: business.slug, logoUrl: "", neighborhood: business.neighborhood, city: "" },
        serviceSnapshot: { nameEs: business.serviceEs, nameEn: business.serviceEn, categoryId: business.categoryId },
        seedDemo: true,
        publishedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }
  });

  await batch.commit();
  return { businesses: showcaseBusinesses.length, services: showcaseBusinesses.length, slots: slotOffsetsInMinutes.length };
}
