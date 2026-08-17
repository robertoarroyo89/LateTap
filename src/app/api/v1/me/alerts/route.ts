import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { categories } from "@/config/categories";
import { errorResponse } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";

const schema = z.object({ categoryId: z.enum(categories.map((item) => item.id) as [string, ...string[]]).optional(), businessId: z.string().max(128).optional(), radiusKm: z.number().positive().max(50).optional(), maxPriceCents: z.number().int().positive().max(1_000_000).optional(), datePreference: z.enum(["today", "tomorrow", "both"]).optional(), locale: z.enum(["es", "en"]) });
export async function GET(request: Request) { try { const user = await authenticateRequest(request); const snapshot = await adminDb().collection("alerts").where("uid", "==", user.uid).limit(100).get(); return Response.json({ data: { items: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) } }); } catch (error) { return errorResponse(error); } }
export async function POST(request: Request) { try { assertSameOrigin(request); const user = await authenticateRequest(request); const input = schema.parse(await request.json()); const ref = adminDb().collection("alerts").doc(); await ref.create({ id: ref.id, uid: user.uid, enabled: true, ...input, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }); return Response.json({ data: { id: ref.id } }, { status: 201 }); } catch (error) { return errorResponse(error); } }
