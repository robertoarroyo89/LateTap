import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { AppError, errorResponse } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";

const schema = z.object({ descriptionEs: z.string().trim().min(20).max(1000).optional(), descriptionEn: z.string().trim().max(1000).optional(), phone: z.string().trim().max(30).optional(), whatsapp: z.string().trim().max(30).optional(), website: z.url().optional().or(z.literal("")), instagram: z.string().trim().max(80).optional(), showExactAddress: z.boolean().optional() });
async function owned(uid: string) { const result = await adminDb().collection("businesses").where("ownerUid", "==", uid).limit(1).get(); if (result.empty) throw new AppError("FORBIDDEN", "Business ownership required", 403); return result.docs[0]; }
export async function GET(request: Request) { try { const user = await authenticateRequest(request); const business = await owned(user.uid); return Response.json({ data: { id: business.id, ...business.data() } }); } catch (error) { return errorResponse(error); } }
export async function PATCH(request: Request) { try { assertSameOrigin(request); const user = await authenticateRequest(request); const input = schema.parse(await request.json()); const business = await owned(user.uid); await business.ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() }); return Response.json({ data: { id: business.id } }); } catch (error) { return errorResponse(error); } }
