import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { AppError } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import type { Reservation } from "@/types/domain";

type ReservationOwnerField = "customerUid" | "businessId";

function isMissingIndexError(error: unknown) {
  const code = (error as { code?: unknown } | null)?.code;
  return code === 9 || code === "failed-precondition";
}

export async function listReservationsBy(ownerField: ReservationOwnerField, ownerId: string): Promise<Reservation[]> {
  const collection = adminDb().collection("reservations");

  try {
    const snapshot = await collection
      .where(ownerField, "==", ownerId)
      .orderBy("startAt", "desc")
      .limit(100)
      .get();
    return snapshot.docs.map((item) => serializeReservation(item.id, item.data()));
  } catch (error) {
    if (!isMissingIndexError(error)) throw error;

    console.warn("[reservations] Composite index unavailable; using an in-memory ordering fallback", {
      ownerField,
    });
    const snapshot = await collection.where(ownerField, "==", ownerId).get();
    return snapshot.docs
      .map((item) => serializeReservation(item.id, item.data()))
      .sort((left, right) => new Date(right.startAt).getTime() - new Date(left.startAt).getTime())
      .slice(0, 100);
  }
}

export class ReservationService {
  async reserveSlot(slotId: string, customerUid: string): Promise<{ id: string }> {
    const db = adminDb();
    const slotRef = db.collection("slots").doc(slotId);
    const businessRefFor = (id: string) => db.collection("businesses").doc(id);
    const customerRef = db.collection("users").doc(customerUid);
    const reservationRef = db.collection("reservations").doc();

    return db.runTransaction(async (transaction) => {
      const slotSnapshot = await transaction.get(slotRef);
      if (!slotSnapshot.exists) throw new AppError("SLOT_NOT_FOUND", "Slot not found", 404);
      const slot = slotSnapshot.data()!;

      if (slot.status === "reserved" && slot.reservationId) {
        const existingRef = db.collection("reservations").doc(slot.reservationId);
        const existing = await transaction.get(existingRef);
        if (existing.exists && existing.data()?.customerUid === customerUid) return { id: existing.id };
        throw new AppError("SLOT_ALREADY_RESERVED", "This slot has already been booked", 409);
      }
      if (slot.status !== "published") throw new AppError("SLOT_ALREADY_RESERVED", "This slot is no longer available", 409);
      const startAt = slot.startAt instanceof Timestamp ? slot.startAt.toDate() : new Date(slot.startAt);
      if (startAt.getTime() <= Date.now()) throw new AppError("SLOT_EXPIRED", "This slot has expired", 409);

      const [businessSnapshot, customerSnapshot] = await Promise.all([
        transaction.get(businessRefFor(slot.businessId)),
        transaction.get(customerRef),
      ]);
      if (!businessSnapshot.exists || businessSnapshot.data()?.status !== "approved") {
        throw new AppError("BUSINESS_NOT_APPROVED", "Business is not approved", 409);
      }
      const customer = customerSnapshot.data() ?? {};
      const reservation = {
        id: reservationRef.id,
        slotId,
        businessId: slot.businessId,
        customerUid,
        status: "confirmed",
        startAt: slot.startAt,
        endAt: slot.endAt,
        timezone: slot.timezone,
        priceCents: slot.priceCents,
        currency: slot.currency,
        serviceSnapshot: slot.serviceSnapshot,
        businessSnapshot: slot.businessSnapshot,
        customerSnapshot: {
          displayName: customer.displayName ?? "",
          phone: customer.phone ?? "",
          email: customer.email ?? "",
        },
        createdAt: FieldValue.serverTimestamp(),
      };
      transaction.create(reservationRef, reservation);
      transaction.update(slotRef, { status: "reserved", reservationId: reservationRef.id, updatedAt: FieldValue.serverTimestamp() });
      return { id: reservationRef.id };
    });
  }

  async cancelByCustomer(reservationId: string, customerUid: string, reason?: string) {
    const db = adminDb();
    const reservationRef = db.collection("reservations").doc(reservationId);
    return db.runTransaction(async (transaction) => {
      const reservationSnapshot = await transaction.get(reservationRef);
      if (!reservationSnapshot.exists) throw new AppError("NOT_FOUND", "Reservation not found", 404);
      const reservation = reservationSnapshot.data()!;
      if (reservation.customerUid !== customerUid) throw new AppError("FORBIDDEN", "Not your reservation", 403);
      if (reservation.status !== "confirmed") throw new AppError("INVALID_INPUT", "Reservation cannot be cancelled", 409);
      const slotRef = db.collection("slots").doc(reservation.slotId);
      const slotSnapshot = await transaction.get(slotRef);
      transaction.update(reservationRef, {
        status: "cancelled_by_customer",
        cancelledAt: FieldValue.serverTimestamp(),
        cancelledBy: "customer",
        cancellationReason: reason ?? null,
      });
      if (slotSnapshot.exists) {
        const slot = slotSnapshot.data()!;
        const start = slot.startAt instanceof Timestamp ? slot.startAt.toDate() : new Date(slot.startAt);
        if (start.getTime() > Date.now() && slot.reservationId === reservationId) {
          transaction.update(slotRef, { status: "published", reservationId: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp() });
        }
      }
      return { id: reservationId };
    });
  }

  async updateByBusiness(reservationId: string, ownerUid: string, action: "complete" | "no_show" | "cancel", reason?: string) {
    const db = adminDb();
    const reservationRef = db.collection("reservations").doc(reservationId);
    return db.runTransaction(async (transaction) => {
      const reservationSnapshot = await transaction.get(reservationRef);
      if (!reservationSnapshot.exists) throw new AppError("NOT_FOUND", "Reservation not found", 404);
      const reservation = reservationSnapshot.data()!;
      const businessRef = db.collection("businesses").doc(reservation.businessId);
      const businessSnapshot = await transaction.get(businessRef);
      if (!businessSnapshot.exists || businessSnapshot.data()?.ownerUid !== ownerUid) throw new AppError("FORBIDDEN", "Business ownership required", 403);
      if (reservation.status !== "confirmed") throw new AppError("INVALID_INPUT", "Reservation cannot be updated", 409);
      const slotRef = db.collection("slots").doc(reservation.slotId);
      const now = Timestamp.now();
      if (action === "complete") {
        const start = reservation.startAt instanceof Timestamp ? reservation.startAt.toDate() : new Date(reservation.startAt);
        if (start.getTime() > Date.now()) throw new AppError("INVALID_INPUT", "Appointment has not started", 409);
        transaction.update(reservationRef, { status: "completed", completedAt: now });
        transaction.update(slotRef, { status: "completed", completedAt: now, updatedAt: now });
      } else if (action === "no_show") {
        transaction.update(reservationRef, { status: "no_show", noShowAt: now });
        transaction.update(slotRef, { status: "completed", completedAt: now, updatedAt: now });
      } else {
        transaction.update(reservationRef, { status: "cancelled_by_business", cancelledAt: now, cancelledBy: "business", cancellationReason: reason ?? null });
        transaction.update(slotRef, { status: "cancelled", cancelledAt: now, updatedAt: now });
      }
      return { id: reservationId };
    });
  }
}

export function serializeReservation(id: string, data: FirebaseFirestore.DocumentData): Reservation {
  const iso = (value: unknown) => value instanceof Timestamp ? value.toDate().toISOString() : new Date(value as string).toISOString();
  return {
    ...data,
    id,
    startAt: iso(data.startAt),
    endAt: iso(data.endAt),
    createdAt: iso(data.createdAt),
    cancelledAt: data.cancelledAt ? iso(data.cancelledAt) : undefined,
    completedAt: data.completedAt ? iso(data.completedAt) : undefined,
    noShowAt: data.noShowAt ? iso(data.noShowAt) : undefined,
  } as Reservation;
}
