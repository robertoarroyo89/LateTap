import { z } from "zod";

export const reserveSlotSchema = z.object({ slotId: z.string().min(1).max(128) });
export const cancelReservationSchema = z.object({ reason: z.string().trim().max(500).optional() });
export const updateReservationSchema = z.object({ action: z.enum(["complete", "no_show", "cancel"]), reason: z.string().trim().max(500).optional() });
