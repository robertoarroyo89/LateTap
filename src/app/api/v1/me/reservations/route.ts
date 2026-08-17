import { errorResponse } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { authenticateRequest } from "@/server/auth/session";
import { serializeReservation } from "@/server/services/reservation-service";

export async function GET(request: Request) { try { const user = await authenticateRequest(request); const snapshot = await adminDb().collection("reservations").where("customerUid", "==", user.uid).orderBy("startAt", "desc").limit(100).get(); return Response.json({ data: { items: snapshot.docs.map((item) => serializeReservation(item.id, item.data())) } }); } catch (error) { return errorResponse(error); } }
