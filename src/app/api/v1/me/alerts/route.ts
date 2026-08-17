import { FieldValue, GeoPoint, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

import { categories } from "@/config/categories";
import { errorResponse } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";
import { serializeAlert } from "@/server/services/alert-service";

const categoryIds = categories.map((item) => item.id) as [string, ...string[]];
const createAlertSchema = z.object({
  categoryId: z.enum(categoryIds).optional(),
  businessId: z.string().trim().min(1).max(128).optional(),
  cityKey: z.string().trim().min(2).max(60).default("valencia"),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  radiusKm: z.number().positive().max(50).default(10),
  maxPriceCents: z.number().int().positive().max(1_000_000).optional(),
  datePreference: z.enum(["today", "tomorrow", "both", "week"]).default("both"),
  durationHours: z.union([z.literal(24), z.literal(48), z.literal(72)]).default(48),
  locale: z.enum(["es", "en"]),
}).refine((value) => value.categoryId || value.businessId, {
  message: "Choose a category or business",
  path: ["categoryId"],
});

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    const snapshot = await adminDb().collection("alerts").where("uid", "==", user.uid).limit(100).get();
    const items = snapshot.docs
      .map((item) => serializeAlert(item.id, item.data()))
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
    return Response.json({ data: { items } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await authenticateRequest(request);
    const input = createAlertSchema.parse(await request.json());
    const ref = adminDb().collection("alerts").doc();
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + input.durationHours * 60 * 60 * 1000);
    await ref.create({
      id: ref.id,
      uid: user.uid,
      enabled: true,
      ...input,
      location: input.location ? new GeoPoint(input.location.latitude, input.location.longitude) : null,
      expiresAt,
      matchCount: 0,
      createdAt: now,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return Response.json({ data: { id: ref.id, expiresAt: expiresAt.toDate().toISOString() } }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
