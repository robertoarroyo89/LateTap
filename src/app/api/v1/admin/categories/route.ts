import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { categories } from "@/config/categories";
import { errorResponse } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";

const categoryIds = categories.map((item) => item.id) as [string, ...string[]];
const schema = z.object({ id: z.enum(categoryIds), enabled: z.boolean().optional(), order: z.number().int().min(0).max(1000).optional(), labelEs: z.string().trim().min(2).max(60).optional(), labelEn: z.string().trim().min(2).max(60).optional(), icon: z.string().trim().min(1).max(60).optional() });

export async function GET(request: Request) {
  try { await requireAdmin(request); const snapshot = await adminDb().collection("categories").get(); const overrides = new Map(snapshot.docs.map((item) => [item.id, item.data()])); return Response.json({ data: { items: categories.map((item, order) => ({ ...item, enabled: true, order, icon: item.id, ...overrides.get(item.id) })).sort((a, b) => Number(a.order) - Number(b.order)) } }); } catch (error) { return errorResponse(error); }
}
export async function PATCH(request: Request) {
  try { assertSameOrigin(request); const admin = await requireAdmin(request); const input = schema.parse(await request.json()); const { id, ...fields } = input; await adminDb().collection("categories").doc(id).set({ id, ...fields, updatedBy: admin.uid, updatedAt: FieldValue.serverTimestamp() }, { merge: true }); return Response.json({ data: { id } }); } catch (error) { return errorResponse(error); }
}
