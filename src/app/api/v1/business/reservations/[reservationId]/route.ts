import { errorResponse } from "@/lib/errors";
import { updateReservationSchema } from "@/lib/validation/reservations";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";
import { ReservationService } from "@/server/services/reservation-service";

export async function PATCH(request: Request, { params }: RouteContext<"/api/v1/business/reservations/[reservationId]">) { try { assertSameOrigin(request); const user = await authenticateRequest(request); const { reservationId } = await params; const input = updateReservationSchema.parse(await request.json()); return Response.json({ data: await new ReservationService().updateByBusiness(reservationId, user.uid, input.action, input.reason) }); } catch (error) { return errorResponse(error); } }
