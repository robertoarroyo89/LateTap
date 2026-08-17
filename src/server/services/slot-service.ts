import { FieldValue, GeoPoint, Timestamp } from "firebase-admin/firestore";

import { featureFlags } from "@/config/features";
import { AppError } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { calculateDiscount } from "@/lib/format";
import type { z } from "zod";
import type { createSlotSchema, updateSlotSchema } from "@/lib/validation/slots";

type CreateSlotInput = z.infer<typeof createSlotSchema>;
type UpdateSlotInput = z.infer<typeof updateSlotSchema>;

export class SlotService {
  async create(ownerUid: string, input: CreateSlotInput) {
    const db = adminDb(); const serviceRef = db.collection("services").doc(input.serviceId); const service = await serviceRef.get();
    if (!service.exists || service.data()?.active !== true) throw new AppError("NOT_FOUND", "Service not found", 404);
    const businessRef = db.collection("businesses").doc(service.data()!.businessId); const business = await businessRef.get();
    if (!business.exists || business.data()?.ownerUid !== ownerUid) throw new AppError("FORBIDDEN", "Business ownership required", 403);
    if (business.data()?.status !== "approved") throw new AppError("BUSINESS_NOT_APPROVED", "Business must be approved before publishing", 409);
    if (featureFlags.requireDiscount && input.priceCents >= input.regularPriceCents) throw new AppError("INVALID_PRICE", "A discount is required", 422);
    const start = new Date(input.startAt);
    const end = new Date(start.getTime() + input.durationMinutes * 60_000);
    const ref = db.collection("slots").doc();
    const data = business.data()!;
    const serviceData = service.data()!;
    const location = { latitude: data.location.latitude, longitude: data.location.longitude };
    const businessSnapshot = { name: data.name, slug: data.slug, logoUrl: data.logoUrl ?? "", neighborhood: data.address.neighborhood ?? data.address.city, city: data.address.city };
    const serviceSnapshot = { nameEs: serviceData.nameEs, nameEn: serviceData.nameEn ?? "", categoryId: serviceData.categoryId };
    const discountPercent = calculateDiscount(input.regularPriceCents, input.priceCents);
    await ref.create({ id: ref.id, businessId: business.id, serviceId: service.id, categoryId: serviceData.categoryId, status: "published", startAt: Timestamp.fromDate(start), endAt: Timestamp.fromDate(end), timezone: data.timezone, durationMinutes: input.durationMinutes, regularPriceCents: input.regularPriceCents, priceCents: input.priceCents, currency: data.currency, discountPercent, note: input.note ?? "", location: new GeoPoint(location.latitude, location.longitude), geohash: data.geohash, cityKey: "valencia", businessSnapshot, serviceSnapshot, publishedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    return { id: ref.id };
  }

  async cancel(ownerUid: string, slotId: string) {
    const db = adminDb(); const ref = db.collection("slots").doc(slotId); const snapshot = await ref.get(); if (!snapshot.exists) throw new AppError("NOT_FOUND", "Slot not found", 404); const business = await db.collection("businesses").doc(snapshot.data()!.businessId).get(); if (business.data()?.ownerUid !== ownerUid) throw new AppError("FORBIDDEN", "Business ownership required", 403); if (snapshot.data()?.status === "reserved") throw new AppError("INVALID_INPUT", "Cancel the reservation instead", 409); await ref.update({ status: "cancelled", cancelledAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }); return { id: slotId };
  }

  async update(ownerUid: string, slotId: string, input: UpdateSlotInput) {
    const db = adminDb(); const ref = db.collection("slots").doc(slotId);
    await db.runTransaction(async (transaction) => {
      const slot = await transaction.get(ref); if (!slot.exists) throw new AppError("NOT_FOUND", "Slot not found", 404); const current = slot.data()!;
      if (current.status !== "published" && current.status !== "draft") throw new AppError("INVALID_INPUT", "Only unreserved slots can be edited", 409);
      const business = await transaction.get(db.collection("businesses").doc(current.businessId)); if (business.data()?.ownerUid !== ownerUid) throw new AppError("FORBIDDEN", "Business ownership required", 403);
      const priceCents = input.priceCents ?? current.priceCents; if (priceCents > current.regularPriceCents) throw new AppError("INVALID_PRICE", "Price cannot exceed regular price", 422);
      const startAt = input.startAt ? Timestamp.fromDate(new Date(input.startAt)) : current.startAt; const durationMinutes = input.durationMinutes ?? current.durationMinutes;
      transaction.update(ref, { ...input, startAt, endAt: Timestamp.fromMillis(startAt.toMillis() + durationMinutes * 60_000), durationMinutes, priceCents, discountPercent: calculateDiscount(current.regularPriceCents, priceCents), updatedAt: FieldValue.serverTimestamp() });
    });
    return { id: slotId };
  }

  async duplicate(ownerUid: string, slotId: string, startAt: string) {
    const db = adminDb(); const source = await db.collection("slots").doc(slotId).get(); if (!source.exists) throw new AppError("NOT_FOUND", "Slot not found", 404); const data = source.data()!;
    const business = await db.collection("businesses").doc(data.businessId).get(); if (business.data()?.ownerUid !== ownerUid) throw new AppError("FORBIDDEN", "Business ownership required", 403);
    return this.create(ownerUid, { serviceId: data.serviceId, startAt, durationMinutes: data.durationMinutes, regularPriceCents: data.regularPriceCents, priceCents: data.priceCents, note: data.note ?? "" });
  }
}
