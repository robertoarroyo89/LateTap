import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { errorResponse } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";

const schema = z.object({ entityType: z.enum(["business", "slot", "reservation"]), entityId: z.string().min(1).max(128), reason: z.enum(["incorrect_information", "inappropriate", "fraud", "other"]), details: z.string().trim().max(1000).optional() });

export async function POST(request: Request) {
  try { assertSameOrigin(request); const user = await authenticateRequest(request); const input = schema.parse(await request.json()); const ref = adminDb().collection("reports").doc(); await ref.create({ id: ref.id, reporterUid: user.uid, ...input, status: "open", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }); return Response.json({ data: { id: ref.id } }, { status: 201 }); } catch (error) { return errorResponse(error); }
}
