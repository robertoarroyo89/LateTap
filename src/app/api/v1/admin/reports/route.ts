import { Timestamp } from "firebase-admin/firestore";

import { errorResponse } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/server/auth/session";

export async function GET(request: Request) {
  try { await requireAdmin(request); const snapshot = await adminDb().collection("reports").orderBy("createdAt", "desc").limit(100).get(); return Response.json({ data: { items: snapshot.docs.map((item) => ({ id: item.id, ...item.data(), createdAt: item.data().createdAt instanceof Timestamp ? item.data().createdAt.toDate().toISOString() : null })) } }); } catch (error) { return errorResponse(error); }
}
