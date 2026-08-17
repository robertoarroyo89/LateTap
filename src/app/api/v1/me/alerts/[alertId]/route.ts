import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

import { AppError, errorResponse } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";

const updateSchema = z.object({ enabled: z.boolean() });

export async function PATCH(request: Request, { params }: RouteContext<"/api/v1/me/alerts/[alertId]">) {
  try {
    assertSameOrigin(request);
    const user = await authenticateRequest(request);
    const { alertId } = await params;
    const { enabled } = updateSchema.parse(await request.json());
    const ref = adminDb().collection("alerts").doc(alertId);
    const snapshot = await ref.get();
    if (!snapshot.exists) throw new AppError("NOT_FOUND", "Alert not found", 404);
    if (snapshot.data()?.uid !== user.uid) throw new AppError("FORBIDDEN", "This alert does not belong to you", 403);
    const currentExpiry = snapshot.data()?.expiresAt instanceof Timestamp ? snapshot.data()!.expiresAt.toMillis() : 0;
    const durationHours = snapshot.data()?.durationHours === 24 || snapshot.data()?.durationHours === 72 ? snapshot.data()!.durationHours : 48;
    await ref.update({
      enabled,
      ...(enabled && currentExpiry <= Date.now() ? { expiresAt: Timestamp.fromMillis(Date.now() + durationHours * 60 * 60 * 1000) } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return Response.json({ data: { id: alertId, enabled } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext<"/api/v1/me/alerts/[alertId]">) {
  try {
    assertSameOrigin(request);
    const user = await authenticateRequest(request);
    const { alertId } = await params;
    const ref = adminDb().collection("alerts").doc(alertId);
    const snapshot = await ref.get();
    if (!snapshot.exists) throw new AppError("NOT_FOUND", "Alert not found", 404);
    if (snapshot.data()?.uid !== user.uid) throw new AppError("FORBIDDEN", "This alert does not belong to you", 403);
    await ref.delete();
    return Response.json({ data: { id: alertId } });
  } catch (error) {
    return errorResponse(error);
  }
}
