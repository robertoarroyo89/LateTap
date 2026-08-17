import { distanceBetween } from "geofire-common";

import { demoSlots } from "@/lib/demo-data";
import type { SlotRepository, SlotSearchInput } from "@/server/repositories/slot-repository";
import type { PaginatedResult, Slot } from "@/types/domain";

export class DemoSlotRepository implements SlotRepository {
  async searchPublished(input: SlotSearchInput): Promise<PaginatedResult<Slot>> {
    const now = input.from?.getTime() ?? Date.now();
    const limit = Math.min(input.limit ?? 20, 50);
    const items = demoSlots
      .filter((item) => item.status === "published" && new Date(item.startAt).getTime() > now)
      .filter((item) => item.cityKey === input.cityKey)
      .filter((item) => !input.categoryId || item.categoryId === input.categoryId)
      .filter((item) => !input.to || new Date(item.startAt) <= input.to)
      .filter((item) => !input.maxPriceCents || item.priceCents <= input.maxPriceCents)
      .filter((item) => !input.minimumDiscount || item.discountPercent >= input.minimumDiscount)
      .map((item) => {
        if (input.latitude === undefined || input.longitude === undefined) return item;
        const distanceKm = distanceBetween([input.latitude, input.longitude], [item.location.latitude, item.location.longitude]);
        return { ...item, distanceKm };
      })
      .filter((item) => !input.radiusKm || item.distanceKm === undefined || item.distanceKm <= input.radiusKm)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
      .slice(0, limit);
    return { items };
  }

  async getPublicById(id: string) {
    return demoSlots.find((item) => item.id === id) ?? null;
  }
}
