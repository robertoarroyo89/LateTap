import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

import { AppError, errorResponse } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";
import type { AvailabilityNotification } from "@/types/domain";

function iso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return undefined;
}

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    const snapshot = await adminDb().collection("notifications").where("uid", "==", user.uid).limit(100).get();
    const items = snapshot.docs
      .map((document) => {
        const data = document.data();
        return {
          ...data,
          id: document.id,
          startAt: iso(data.startAt) ?? new Date(0).toISOString(),
          createdAt: iso(data.createdAt) ?? new Date(0).toISOString(),
          readAt: iso(data.readAt),
        } as AvailabilityNotification;
      })
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
    return Response.json({ data: { items } });
  } catch (error) {
    return errorResponse(error);
  }
}

const markReadSchema = z.object({ id: z.string().trim().min(1).max(300) });

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await authenticateRequest(request);
    const { id } = markReadSchema.parse(await request.json());
    const ref = adminDb().collection("notifications").doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) throw new AppError("NOT_FOUND", "Notification not found", 404);
    if (snapshot.data()?.uid !== user.uid) throw new AppError("FORBIDDEN", "This notification does not belong to you", 403);
    await ref.update({ readAt: FieldValue.serverTimestamp() });
    return Response.json({ data: { id } });
  } catch (error) {
    return errorResponse(error);
  }
}
