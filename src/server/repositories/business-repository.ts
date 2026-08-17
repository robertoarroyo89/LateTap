import { Timestamp, type DocumentData } from "firebase-admin/firestore";

import { demoBusinesses, demoSlots } from "@/lib/demo-data";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import type { PublicBusiness, Service, Slot } from "@/types/domain";

function mapBusiness(id: string, data: DocumentData): PublicBusiness {
  return {
    ...data,
    id,
    location: data.location?.latitude !== undefined ? { latitude: data.location.latitude, longitude: data.location.longitude } : { latitude: data.location?._latitude, longitude: data.location?._longitude },
  } as PublicBusiness;
}

function mapService(id: string, data: DocumentData): Service {
  const iso = (value: unknown) => value instanceof Timestamp ? value.toDate().toISOString() : new Date(value as string).toISOString();
  return { ...data, id, createdAt: iso(data.createdAt), updatedAt: iso(data.updatedAt) } as Service;
}

export async function getPublicBusinessBySlug(slug: string): Promise<{ business: PublicBusiness; services: Service[]; slots: Slot[] } | null> {
  if (!isFirebaseAdminConfigured) {
    const business = demoBusinesses.find((item) => item.slug === slug);
    if (!business) return null;
    const services: Service[] = demoSlots.filter((item) => item.businessId === business.id).map((item) => ({
      id: item.serviceId, businessId: item.businessId, categoryId: item.categoryId,
      nameEs: item.serviceSnapshot.nameEs, nameEn: item.serviceSnapshot.nameEn,
      regularPriceCents: item.regularPriceCents, currency: item.currency,
      durationMinutes: item.durationMinutes, active: true,
      createdAt: item.createdAt, updatedAt: item.updatedAt,
    })).filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);
    return { business, services, slots: demoSlots.filter((item) => item.businessId === business.id && item.status === "published" && new Date(item.startAt) > new Date()) };
  }
  const db = adminDb();
  const businessQuery = await db.collection("businesses").where("slug", "==", slug).where("status", "==", "approved").limit(1).get();
  if (businessQuery.empty) return null;
  const document = businessQuery.docs[0];
  const [servicesSnapshot, slotsSnapshot] = await Promise.all([
    db.collection("services").where("businessId", "==", document.id).where("active", "==", true).get(),
    db.collection("slots").where("businessId", "==", document.id).where("status", "==", "published").where("startAt", ">", Timestamp.now()).orderBy("startAt").limit(20).get(),
  ]);
  const { mapSlot } = await import("@/server/repositories/firebase-slot-repository");
  return { business: mapBusiness(document.id, document.data()), services: servicesSnapshot.docs.map((item) => mapService(item.id, item.data())), slots: slotsSnapshot.docs.map(mapSlot) };
}
