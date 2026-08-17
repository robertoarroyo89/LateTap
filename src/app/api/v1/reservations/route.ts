import { errorResponse } from "@/lib/errors";
import { reserveSlotSchema } from "@/lib/validation/reservations";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";
import { rateLimit } from "@/server/security/rate-limit";
import { ReservationService } from "@/server/services/reservation-service";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await authenticateRequest(request);
    rateLimit(`reservation:${user.uid}`, 8, 60_000);
    const { slotId } = reserveSlotSchema.parse(await request.json());
    const result = await new ReservationService().reserveSlot(slotId, user.uid);
    return Response.json({ data: result }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
