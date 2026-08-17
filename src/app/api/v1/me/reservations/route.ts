import { errorResponse } from "@/lib/errors";
import { authenticateRequest } from "@/server/auth/session";
import { listReservationsBy } from "@/server/services/reservation-service";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    return Response.json({ data: { items: await listReservationsBy("customerUid", user.uid) } });
  } catch (error) {
    return errorResponse(error);
  }
}
