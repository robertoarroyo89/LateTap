import { errorResponse } from "@/lib/errors";
import { moderationSchema } from "@/lib/validation/businesses";
import { requireAdmin } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";
import { BusinessService } from "@/server/services/business-service";

export async function PATCH(request: Request, { params }: RouteContext<"/api/v1/admin/businesses/[businessId]">) { try { assertSameOrigin(request); const admin = await requireAdmin(request); const { businessId } = await params; const input = moderationSchema.parse(await request.json()); return Response.json({ data: await new BusinessService().moderate(admin.uid, businessId, input) }); } catch (error) { return errorResponse(error); } }
