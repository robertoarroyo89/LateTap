import { errorResponse, AppError } from "@/lib/errors";
import { adminDb } from "@/lib/firebase/admin";
import { authenticateRequest } from "@/server/auth/session";
import { listReservationsBy } from "@/server/services/reservation-service";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    const business = await adminDb().collection("businesses").where("ownerUid", "==", user.uid).limit(1).get();
    if (business.empty) throw new AppError("FORBIDDEN", "Business ownership required", 403);
    return Response.json({ data: { items: await listReservationsBy("businessId", business.docs[0].id) } });
  } catch (error) {
    return errorResponse(error);
  }
}
