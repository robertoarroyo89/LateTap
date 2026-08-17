import { Timestamp } from "firebase-admin/firestore";
import { after } from "next/server";

import { errorResponse } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { createSlotSchema } from "@/lib/validation/slots";
import { authenticateRequest } from "@/server/auth/session";
import { mapSlot } from "@/server/repositories/firebase-slot-repository";
import { assertSameOrigin } from "@/server/security/origin";
import { notifyMatchingAlerts } from "@/server/services/alert-service";
import { SlotService } from "@/server/services/slot-service";

export async function GET(request: Request) { try { const user = await authenticateRequest(request); const business = await adminDb().collection("businesses").where("ownerUid", "==", user.uid).limit(1).get(); if (business.empty) return Response.json({ data: { items: [] } }); const snapshot = await adminDb().collection("slots").where("businessId", "==", business.docs[0].id).where("startAt", ">", Timestamp.fromMillis(0)).orderBy("startAt", "desc").limit(100).get(); return Response.json({ data: { items: snapshot.docs.map(mapSlot) } }); } catch (error) { return errorResponse(error); } }
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await authenticateRequest(request);
    const input = createSlotSchema.parse(await request.json());
    const result = await new SlotService().create(user.uid, input);
    after(async () => {
      try {
        const slot = await adminDb().collection("slots").doc(result.id).get();
        if (slot.exists) await notifyMatchingAlerts(mapSlot(slot));
      } catch (error) {
        console.error("[alerts] Could not notify matching availability alerts", error);
      }
    });
    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
