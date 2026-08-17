import { FieldValue, GeoPoint, Timestamp } from "firebase-admin/firestore";
import { beforeEach, describe, expect, it } from "vitest";

import { adminDb } from "@/lib/firebase/admin";
import { ReservationService } from "@/server/services/reservation-service";

const integration = process.env.FIRESTORE_EMULATOR_HOST ? describe : describe.skip;

integration("reservation transaction", () => {
  const ids = { business: "test-business", slot: "test-slot", userA: "test-user-a", userB: "test-user-b" };
  beforeEach(async () => {
    const db = adminDb();
    await Promise.all([db.recursiveDelete(db.collection("reservations")), db.recursiveDelete(db.collection("slots")), db.recursiveDelete(db.collection("businesses")), db.recursiveDelete(db.collection("users"))]);
    const batch = db.batch();
    batch.set(db.collection("businesses").doc(ids.business), { ownerUid: "owner", status: "approved", name: "Test", slug: "test", verified: true });
    for (const uid of [ids.userA, ids.userB]) batch.set(db.collection("users").doc(uid), { uid, email: `${uid}@example.test`, displayName: uid });
    batch.set(db.collection("slots").doc(ids.slot), { businessId: ids.business, serviceId: "service", categoryId: "barber", status: "published", startAt: Timestamp.fromMillis(Date.now() + 3_600_000), endAt: Timestamp.fromMillis(Date.now() + 7_200_000), timezone: "Europe/Madrid", durationMinutes: 60, regularPriceCents: 3000, priceCents: 2200, currency: "EUR", businessSnapshot: { name: "Test", slug: "test", neighborhood: "Ruzafa", city: "Valencia" }, serviceSnapshot: { nameEs: "Corte", categoryId: "barber" }, location: new GeoPoint(39.46, -0.37), geohash: "ezp8", cityKey: "valencia", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    await batch.commit();
  });

  it("allows exactly one of two customers to reserve the same slot", async () => {
    const service = new ReservationService();
    const results = await Promise.allSettled([service.reserveSlot(ids.slot, ids.userA), service.reserveSlot(ids.slot, ids.userB)]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    const snapshot = await adminDb().collection("slots").doc(ids.slot).get();
    expect(snapshot.data()?.status).toBe("reserved");
  });
});
