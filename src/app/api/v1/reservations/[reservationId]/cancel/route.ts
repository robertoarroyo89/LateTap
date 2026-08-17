import { errorResponse } from "@/lib/errors";
import { cancelReservationSchema } from "@/lib/validation/reservations";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";
import { ReservationService } from "@/server/services/reservation-service";

export async function POST(request: Request, { params }: RouteContext<"/api/v1/reservations/[reservationId]/cancel">) {
  try {
    assertSameOrigin(request);
    const user = await authenticateRequest(request);
    const { reservationId } = await params;
    const { reason } = cancelReservationSchema.parse(await request.json());
    const result = await new ReservationService().cancelByCustomer(reservationId, user.uid, reason);
    return Response.json({ data: result });
  } catch (error) { return errorResponse(error); }
}
