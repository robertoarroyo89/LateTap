import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { appConfig } from "@/config/app";
import { errorResponse } from "@/lib/errors";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";

const profileSchema = z.object({ displayName: z.string().trim().min(2).max(80).optional(), phone: z.string().trim().max(30).optional(), preferredLocale: z.enum(appConfig.locales).optional(), defaultCity: z.string().trim().max(60).optional() });

export async function GET(request: Request) { try { const user = await authenticateRequest(request); const snapshot = await adminDb().collection("users").doc(user.uid).get(); return Response.json({ data: snapshot.exists ? snapshot.data() : { uid: user.uid, email: user.email } }); } catch (error) { return errorResponse(error); } }

export async function PATCH(request: Request) {
  try { assertSameOrigin(request); const user = await authenticateRequest(request); const input = profileSchema.parse(await request.json()); const ref = adminDb().collection("users").doc(user.uid); const current = await ref.get(); const now = FieldValue.serverTimestamp(); await ref.set({ uid: user.uid, email: user.email ?? "", displayName: input.displayName ?? user.name ?? current.data()?.displayName ?? "", phone: input.phone ?? current.data()?.phone ?? "", preferredLocale: input.preferredLocale ?? current.data()?.preferredLocale ?? "es", defaultCity: input.defaultCity ?? current.data()?.defaultCity ?? "valencia", roles: current.data()?.roles ?? ["customer"], createdAt: current.exists ? current.data()?.createdAt : now, updatedAt: now, lastLoginAt: now, termsVersion: current.data()?.termsVersion ?? appConfig.legalVersion }, { merge: true }); return Response.json({ data: { uid: user.uid } }); }
  catch (error) { return errorResponse(error); }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await authenticateRequest(request);
    const db = adminDb();
    const [activeBookings, ownedBusinesses, reservations] = await Promise.all([
      db.collection("reservations").where("customerUid", "==", user.uid).where("status", "==", "confirmed").limit(1).get(),
      db.collection("businesses").where("ownerUid", "==", user.uid).where("status", "in", ["pending_review", "approved"]).limit(1).get(),
      db.collection("reservations").where("customerUid", "==", user.uid).get(),
    ]);
    if (!activeBookings.empty) return Response.json({ error: { code: "ACTIVE_BOOKINGS", message: "Cancel active bookings before deleting your account" } }, { status: 409 });
    if (!ownedBusinesses.empty) return Response.json({ error: { code: "ACTIVE_BUSINESS", message: "Deactivate your business before deleting your account" } }, { status: 409 });
    const writer = db.bulkWriter();
    for (const reservation of reservations.docs) writer.update(reservation.ref, { customerSnapshot: { displayName: "Deleted user", email: "", phone: "" }, customerUid: `deleted:${user.uid}`, updatedAt: FieldValue.serverTimestamp() });
    await writer.close();
    await db.collection("users").doc(user.uid).set({ email: "", displayName: "Deleted user", phone: "", photoURL: "", deletedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    await adminAuth().revokeRefreshTokens(user.uid);
    await adminAuth().deleteUser(user.uid);
    const cookieStore = await import("next/headers").then(({ cookies }) => cookies());
    cookieStore.delete(appConfig.sessionCookieName);
    return Response.json({ data: { deleted: true } });
  } catch (error) { return errorResponse(error); }
}
