import { Timestamp } from "firebase-admin/firestore";

import { errorResponse } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/server/auth/session";

export async function GET(request: Request) { try { await requireAdmin(request); const status = new URL(request.url).searchParams.get("status"); let query = adminDb().collection("businesses").orderBy("createdAt", "desc"); if (status) query = query.where("status", "==", status); const snapshot = await query.limit(100).get(); const iso = (value: unknown) => value instanceof Timestamp ? value.toDate().toISOString() : null; return Response.json({ data: { items: snapshot.docs.map((item) => ({ id: item.id, ...item.data(), createdAt: iso(item.data().createdAt), submittedAt: iso(item.data().submittedAt) })) } }); } catch (error) { return errorResponse(error); } }
