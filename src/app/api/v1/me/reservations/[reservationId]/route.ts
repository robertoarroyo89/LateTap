import { errorResponse } from "@/lib/errors";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";
import { ReservationService } from "@/server/services/reservation-service";

export async function DELETE(request: Request, { params }: RouteContext<"/api/v1/me/reservations/[reservationId]">) {
  try {
    assertSameOrigin(request);
    const user = await authenticateRequest(request);
    const { reservationId } = await params;
    return Response.json({ data: await new ReservationService().hideFromCustomer(reservationId, user.uid) });
  } catch (error) {
    return errorResponse(error);
  }
}
