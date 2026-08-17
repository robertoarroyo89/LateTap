import { FieldValue } from "firebase-admin/firestore";

import { errorResponse, AppError } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { serviceSchema } from "@/lib/validation/businesses";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";

export async function GET(request: Request) { try { const user = await authenticateRequest(request); const business = await adminDb().collection("businesses").where("ownerUid", "==", user.uid).limit(1).get(); if (business.empty) return Response.json({ data: { items: [] } }); const services = await adminDb().collection("services").where("businessId", "==", business.docs[0].id).get(); return Response.json({ data: { items: services.docs.map((item) => ({ id: item.id, ...item.data() })) } }); } catch (error) { return errorResponse(error); } }
export async function POST(request: Request) { try { assertSameOrigin(request); const user = await authenticateRequest(request); const input = serviceSchema.parse(await request.json()); const business = await adminDb().collection("businesses").where("ownerUid", "==", user.uid).limit(1).get(); if (business.empty) throw new AppError("FORBIDDEN", "Business ownership required", 403); const ref = adminDb().collection("services").doc(); await ref.create({ id: ref.id, businessId: business.docs[0].id, ...input, currency: "EUR", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }); return Response.json({ data: { id: ref.id } }, { status: 201 }); } catch (error) { return errorResponse(error); } }
