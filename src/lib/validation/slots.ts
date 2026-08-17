import { z } from "zod";

export const searchSlotsSchema = z.object({
  city: z.string().trim().min(2).max(60).default("valencia"),
  category: z.string().trim().max(60).optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  maxPriceCents: z.coerce.number().int().positive().max(1_000_000).optional(),
  minimumDiscount: z.coerce.number().int().min(0).max(100).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(50).optional(),
  limit: z.coerce.number().int().positive().max(50).default(20),
  cursor: z.string().max(500).optional(),
});

export const createSlotSchema = z.object({
  serviceId: z.string().min(1).max(128),
  startAt: z.iso.datetime(),
  durationMinutes: z.number().int().min(10).max(480),
  regularPriceCents: z.number().int().positive().max(1_000_000),
  priceCents: z.number().int().positive().max(1_000_000),
  note: z.string().trim().max(500).optional(),
}).superRefine((value, context) => {
  if (value.priceCents > value.regularPriceCents) {
    context.addIssue({ code: "custom", path: ["priceCents"], message: "Price cannot exceed regular price" });
  }
  if (new Date(value.startAt).getTime() <= Date.now()) {
    context.addIssue({ code: "custom", path: ["startAt"], message: "Slot must be in the future" });
  }
});

export const updateSlotSchema = z.object({
  startAt: z.iso.datetime().optional(),
  durationMinutes: z.number().int().min(10).max(480).optional(),
  priceCents: z.number().int().positive().max(1_000_000).optional(),
  note: z.string().trim().max(500).optional(),
}).refine((value) => Object.keys(value).length > 0, "At least one field is required").superRefine((value, context) => {
  if (value.startAt && new Date(value.startAt).getTime() <= Date.now()) context.addIssue({ code: "custom", path: ["startAt"], message: "Slot must be in the future" });
});
