import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { AppError, errorResponse } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";

const schema = z.object({ status: z.enum(["reviewing", "resolved", "dismissed"]), resolution: z.string().trim().max(1000).optional() });
export async function PATCH(request: Request, { params }: RouteContext<"/api/v1/admin/reports/[reportId]">) {
  try { assertSameOrigin(request); const admin = await requireAdmin(request); const { reportId } = await params; const input = schema.parse(await request.json()); const ref = adminDb().collection("reports").doc(reportId); if (!(await ref.get()).exists) throw new AppError("NOT_FOUND", "Report not found", 404); const batch = adminDb().batch(); batch.update(ref, { ...input, resolvedBy: admin.uid, updatedAt: FieldValue.serverTimestamp() }); const audit = adminDb().collection("auditLogs").doc(); batch.create(audit, { adminUid: admin.uid, action: `report_${input.status}`, entityType: "report", entityId: reportId, metadata: { resolution: input.resolution ?? null }, createdAt: FieldValue.serverTimestamp() }); await batch.commit(); return Response.json({ data: { id: reportId, status: input.status } }); } catch (error) { return errorResponse(error); }
}
