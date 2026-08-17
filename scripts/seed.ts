import { FieldValue, GeoPoint, Timestamp } from "firebase-admin/firestore";
import { geohashForLocation } from "geofire-common";

import { categories } from "../src/config/categories";
import { adminAuth, adminDb } from "../src/lib/firebase/admin";

const remoteAllowed = process.env.ALLOW_REMOTE_SEED === "true";
const emulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST);
if (!emulator && !remoteAllowed) throw new Error("Seed is emulator-only by default. Set ALLOW_REMOTE_SEED=true explicitly for a non-production development project.");

const names = ["Luma Studio", "Norte Barber Club", "Marea Wellness", "Studio Nácar", "Brava Hair", "Calma Massage", "Aura Nails", "Atelier 22", "Senda Fisio", "Oliva Beauty"];
const neighborhoods = ["Ruzafa", "Benimaclet", "El Carmen", "Campanar", "Patraix", "Algirós", "Extramurs"];
const centers = [[39.4594,-0.3732],[39.486,-0.359],[39.478,-0.38],[39.485,-0.398],[39.46,-0.395],[39.473,-0.35],[39.471,-0.391]] as const;
const categorySequence = ["hair", "barber", "wellness", "beauty", "hair", "massage", "nails", "brows-lashes", "physio", "beauty"] as const;

async function ensureUser(uid: string, email: string, roles: string[], admin = false) {
  try { await adminAuth().getUser(uid); } catch { await adminAuth().createUser({ uid, email, password: "DemoPass!2026", displayName: uid.replace("demo-", "") }); }
  await adminAuth().setCustomUserClaims(uid, { roles, admin });
  await adminDb().collection("users").doc(uid).set({ uid, email, displayName: uid.replace("demo-", ""), roles, preferredLocale: "es", defaultCity: "valencia", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), lastLoginAt: FieldValue.serverTimestamp() }, { merge: true });
}

async function seed() {
  const db = adminDb();
  await Promise.all([ensureUser("demo-customer", "customer@demo.latetap.test", ["customer"]), ensureUser("demo-business", "business@demo.latetap.test", ["customer", "businessOwner"]), ensureUser("demo-admin", "admin@demo.latetap.test", ["customer"], true)]);
  const categoryBatch = db.batch();
  categories.forEach((category, index) => categoryBatch.set(db.collection("categories").doc(category.id), { ...category, enabled: true, order: index, icon: category.id, createdAt: FieldValue.serverTimestamp() }, { merge: true }));
  await categoryBatch.commit();

  for (let index = 0; index < names.length; index += 1) {
    const businessId = `demo-business-${String(index + 1).padStart(2,"0")}`; const categoryId = categorySequence[index]; const neighborhood = neighborhoods[index % neighborhoods.length]; const [latitude, longitude] = centers[index % centers.length];
    const serviceId = `demo-service-${String(index + 1).padStart(2,"0")}`; const regular = 2400 + index * 300;
    const batch = db.batch();
    batch.set(db.collection("businesses").doc(businessId), { id: businessId, ownerUid: index === 0 ? "demo-business" : `seed-owner-${index}`, name: names[index], slug: names[index].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-$/,""), status: "approved", primaryCategoryId: categoryId, categoryIds: [categoryId], descriptionEs: `Negocio demo de ${neighborhood} para probar LateTap en desarrollo.`, descriptionEn: `Demo business in ${neighborhood} for LateTap development.`, email: `demo${index + 1}@latetap.test`, phone: "+34960000000", address: { street: "Dirección demo", number: "", postalCode: "46000", city: "Valencia", region: "Valencia", country: "España", countryCode: "ES", neighborhood }, location: new GeoPoint(latitude, longitude), geohash: geohashForLocation([latitude, longitude]), timezone: "Europe/Madrid", currency: "EUR", verified: true, showExactAddress: false, seedDemo: true, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), approvedAt: FieldValue.serverTimestamp() }, { merge: true });
    batch.set(db.collection("services").doc(serviceId), { id: serviceId, businessId, categoryId, nameEs: `Servicio ${names[index]}`, nameEn: `${names[index]} service`, regularPriceCents: regular, currency: "EUR", durationMinutes: 30 + (index % 3) * 15, active: true, seedDemo: true, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    for (let slotIndex = 0; slotIndex < 4; slotIndex += 1) { const id = `demo-slot-${String(index + 1).padStart(2,"0")}-${slotIndex + 1}`; const start = new Date(Date.now() + (index % 4 + slotIndex * 6 + 2) * 3_600_000); const duration = 30 + (index % 3) * 15; batch.set(db.collection("slots").doc(id), { id, businessId, serviceId, categoryId, status: "published", startAt: Timestamp.fromDate(start), endAt: Timestamp.fromMillis(start.getTime() + duration * 60_000), timezone: "Europe/Madrid", durationMinutes: duration, regularPriceCents: regular, priceCents: Math.round(regular * (0.7 + (slotIndex % 3) * .05)), currency: "EUR", discountPercent: Math.round(30 - (slotIndex % 3) * 5), note: "", location: new GeoPoint(latitude, longitude), geohash: geohashForLocation([latitude, longitude]), cityKey: "valencia", businessSnapshot: { name: names[index], slug: names[index].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-$/,""), logoUrl: "", neighborhood, city: "Valencia" }, serviceSnapshot: { nameEs: `Servicio ${names[index]}`, nameEn: `${names[index]} service`, categoryId }, seedDemo: true, publishedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true }); }
    await batch.commit();
  }
  console.info("LateTap seed complete: 10 businesses, 10 services, 40 live slots, and 3 emulator users.");
}

seed().catch((error) => { console.error(error); process.exitCode = 1; });
