import { z } from "zod";
import { errorResponse } from "@/lib/errors";
import { updateSlotSchema } from "@/lib/validation/slots";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";
import { SlotService } from "@/server/services/slot-service";

export async function DELETE(request: Request, { params }: RouteContext<"/api/v1/business/slots/[slotId]">) { try { assertSameOrigin(request); const user = await authenticateRequest(request); const { slotId } = await params; return Response.json({ data: await new SlotService().cancel(user.uid, slotId) }); } catch (error) { return errorResponse(error); } }
export async function PATCH(request: Request, { params }: RouteContext<"/api/v1/business/slots/[slotId]">) { try { assertSameOrigin(request); const user = await authenticateRequest(request); const { slotId } = await params; return Response.json({ data: await new SlotService().update(user.uid, slotId, updateSlotSchema.parse(await request.json())) }); } catch (error) { return errorResponse(error); } }
export async function POST(request: Request, { params }: RouteContext<"/api/v1/business/slots/[slotId]">) { try { assertSameOrigin(request); const user = await authenticateRequest(request); const { slotId } = await params; const { startAt } = z.object({ startAt: z.iso.datetime() }).parse(await request.json()); return Response.json({ data: await new SlotService().duplicate(user.uid, slotId, startAt) }, { status: 201 }); } catch (error) { return errorResponse(error); } }
