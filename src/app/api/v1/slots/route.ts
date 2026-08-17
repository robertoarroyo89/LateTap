import { categories } from "@/config/categories";
import { errorResponse } from "@/lib/errors";
import { searchSlotsSchema } from "@/lib/validation/slots";
import { getSlotRepository } from "@/server/repositories";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = searchSlotsSchema.parse(Object.fromEntries(url.searchParams));
    const categoryId = categories.some((item) => item.id === query.category) ? query.category as (typeof categories)[number]["id"] : undefined;
    const result = await getSlotRepository().searchPublished({
      cityKey: query.city,
      categoryId,
      from: query.from ? new Date(query.from) : new Date(),
      to: query.to ? new Date(query.to) : undefined,
      maxPriceCents: query.maxPriceCents,
      minimumDiscount: query.minimumDiscount,
      latitude: query.lat,
      longitude: query.lng,
      radiusKm: query.radiusKm,
      limit: query.limit,
      cursor: query.cursor,
    });
    return Response.json({ data: result });
  } catch (error) { return errorResponse(error); }
}
