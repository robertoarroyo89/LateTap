import { FieldValue } from "firebase-admin/firestore";

import { AppError, errorResponse } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { serviceSchema } from "@/lib/validation/businesses";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";

async function ownedService(uid: string, serviceId: string) {
  const db = adminDb(); const service = await db.collection("services").doc(serviceId).get(); if (!service.exists) throw new AppError("NOT_FOUND", "Service not found", 404);
  const business = await db.collection("businesses").doc(service.data()!.businessId).get(); if (business.data()?.ownerUid !== uid) throw new AppError("FORBIDDEN", "Business ownership required", 403);
  return service;
}

export async function PATCH(request: Request, { params }: RouteContext<"/api/v1/business/services/[serviceId]">) {
  try { assertSameOrigin(request); const user = await authenticateRequest(request); const { serviceId } = await params; const input = serviceSchema.partial().refine((value) => Object.keys(value).length > 0).parse(await request.json()); const service = await ownedService(user.uid, serviceId); await service.ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() }); return Response.json({ data: { id: serviceId } }); } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: Request, { params }: RouteContext<"/api/v1/business/services/[serviceId]">) {
  try { assertSameOrigin(request); const user = await authenticateRequest(request); const { serviceId } = await params; const service = await ownedService(user.uid, serviceId); await service.ref.update({ active: false, updatedAt: FieldValue.serverTimestamp() }); return Response.json({ data: { id: serviceId, active: false } }); } catch (error) { return errorResponse(error); }
}
