import { errorResponse } from "@/lib/errors";
import { getSlotRepository } from "@/server/repositories";

export async function GET(_request: Request, { params }: RouteContext<"/api/v1/slots/[slotId]">) {
  try {
    const { slotId } = await params;
    const slot = await getSlotRepository().getPublicById(slotId);
    return slot ? Response.json({ data: slot }) : Response.json({ error: { code: "SLOT_NOT_FOUND", message: "Slot not found" } }, { status: 404 });
  } catch (error) { return errorResponse(error); }
}
