import type { CategoryId } from "@/config/categories";
import type { PaginatedResult, Slot } from "@/types/domain";

export interface SlotSearchInput {
  cityKey: string;
  categoryId?: CategoryId;
  from?: Date;
  to?: Date;
  maxPriceCents?: number;
  minimumDiscount?: number;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  limit?: number;
  cursor?: string;
}

export interface SlotRepository {
  searchPublished(input: SlotSearchInput): Promise<PaginatedResult<Slot>>;
  getPublicById(id: string): Promise<Slot | null>;
}
