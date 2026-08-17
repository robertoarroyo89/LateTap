import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { errorResponse } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";

const schema = z.object({ businessId: z.string().min(1).max(128) });
export async function GET(request: Request) { try { const user = await authenticateRequest(request); const snapshot = await adminDb().collection("users").doc(user.uid).collection("favorites").limit(100).get(); return Response.json({ data: { items: snapshot.docs.map((item) => item.data()) } }); } catch (error) { return errorResponse(error); } }
export async function POST(request: Request) { try { assertSameOrigin(request); const user = await authenticateRequest(request); const { businessId } = schema.parse(await request.json()); const business = await adminDb().collection("businesses").doc(businessId).get(); if (!business.exists || business.data()?.status !== "approved") return Response.json({ error: { code: "NOT_FOUND", message: "Business not found" } }, { status: 404 }); await adminDb().collection("users").doc(user.uid).collection("favorites").doc(businessId).set({ businessId, name: business.data()!.name, slug: business.data()!.slug, categoryId: business.data()!.primaryCategoryId, createdAt: FieldValue.serverTimestamp() }); return Response.json({ data: { businessId } }, { status: 201 }); } catch (error) { return errorResponse(error); } }
export async function DELETE(request: Request) { try { assertSameOrigin(request); const user = await authenticateRequest(request); const { businessId } = schema.parse(await request.json()); await adminDb().collection("users").doc(user.uid).collection("favorites").doc(businessId).delete(); return Response.json({ data: { businessId } }); } catch (error) { return errorResponse(error); } }
