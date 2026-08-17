import { errorResponse } from "@/lib/errors";
import { businessOnboardingSchema } from "@/lib/validation/businesses";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";
import { rateLimit } from "@/server/security/rate-limit";
import { BusinessService } from "@/server/services/business-service";

export async function POST(request: Request) { try { assertSameOrigin(request); const user = await authenticateRequest(request); rateLimit(`business-submit:${user.uid}`, 3, 60 * 60_000); const input = businessOnboardingSchema.parse(await request.json()); return Response.json({ data: await new BusinessService().submit(user.uid, input) }, { status: 201 }); } catch (error) { return errorResponse(error); } }
