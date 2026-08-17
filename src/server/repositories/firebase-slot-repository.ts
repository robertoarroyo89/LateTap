import { Timestamp, type DocumentData, type QueryDocumentSnapshot } from "firebase-admin/firestore";
import { distanceBetween, geohashQueryBounds } from "geofire-common";

import { adminDb } from "@/lib/firebase/admin";
import type { SlotRepository, SlotSearchInput } from "@/server/repositories/slot-repository";
import type { Slot } from "@/types/domain";

function iso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date(0).toISOString();
}

export function mapSlot(snapshot: QueryDocumentSnapshot<DocumentData>): Slot {
  const data = snapshot.data();
  return {
    ...data,
    id: snapshot.id,
    startAt: iso(data.startAt),
    endAt: iso(data.endAt),
    publishedAt: data.publishedAt ? iso(data.publishedAt) : undefined,
    createdAt: iso(data.createdAt),
    updatedAt: iso(data.updatedAt),
    cancelledAt: data.cancelledAt ? iso(data.cancelledAt) : undefined,
    completedAt: data.completedAt ? iso(data.completedAt) : undefined,
    location: data.location?.latitude !== undefined
      ? { latitude: data.location.latitude, longitude: data.location.longitude }
      : { latitude: data.location?._latitude, longitude: data.location?._longitude },
  } as Slot;
}

export class FirebaseSlotRepository implements SlotRepository {
  async searchPublished(input: SlotSearchInput) {
    const db = adminDb();
    const limit = Math.min(input.limit ?? 20, 50);
    const from = Timestamp.fromDate(input.from ?? new Date());
    let candidates: Slot[] = [];

    if (input.latitude !== undefined && input.longitude !== undefined && input.radiusKm) {
      const bounds = geohashQueryBounds([input.latitude, input.longitude], input.radiusKm * 1000);
      const snapshots = await Promise.all(bounds.map(([start, end]) => db.collection("slots")
        .where("status", "==", "published")
        .where("cityKey", "==", input.cityKey)
        .where("geohash", ">=", start)
        .where("geohash", "<=", end)
        .limit(limit)
        .get()));
      const unique = new Map<string, Slot>();
      for (const snapshot of snapshots) for (const document of snapshot.docs) unique.set(document.id, mapSlot(document));
      candidates = [...unique.values()].map((slot) => ({
        ...slot,
        distanceKm: distanceBetween([input.latitude!, input.longitude!], [slot.location.latitude, slot.location.longitude]),
      })).filter((slot) => slot.distanceKm! <= input.radiusKm!);
    } else {
      let query = db.collection("slots")
        .where("status", "==", "published")
        .where("cityKey", "==", input.cityKey)
        .where("startAt", ">", from)
        .orderBy("startAt", "asc");
      if (input.categoryId) query = query.where("categoryId", "==", input.categoryId);
      const snapshot = await query.limit(limit).get();
      candidates = snapshot.docs.map(mapSlot);
    }

    const items = candidates
      .filter((slot) => new Date(slot.startAt) > (input.from ?? new Date()))
      .filter((slot) => !input.to || new Date(slot.startAt) <= input.to)
      .filter((slot) => !input.maxPriceCents || slot.priceCents <= input.maxPriceCents)
      .filter((slot) => !input.minimumDiscount || slot.discountPercent >= input.minimumDiscount)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
      .slice(0, limit);
    return { items };
  }

  async getPublicById(id: string) {
    const snapshot = await adminDb().collection("slots").doc(id).get();
    if (!snapshot.exists) return null;
    return mapSlot(snapshot as QueryDocumentSnapshot<DocumentData>);
  }
}
