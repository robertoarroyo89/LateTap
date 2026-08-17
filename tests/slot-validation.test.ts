import { describe, expect, it } from "vitest";
import { createSlotSchema } from "@/lib/validation/slots";

describe("slot validation", () => {
  const valid = { serviceId: "service-1", startAt: new Date(Date.now() + 3_600_000).toISOString(), durationMinutes: 45, regularPriceCents: 3000, priceCents: 2200 };
  it("rejects past inventory", () => { expect(createSlotSchema.safeParse({ ...valid, startAt: new Date(Date.now() - 1000).toISOString() }).success).toBe(false); });
  it("rejects client price inflation", () => { expect(createSlotSchema.safeParse({ ...valid, priceCents: 4000 }).success).toBe(false); });
  it("accepts a valid last-minute slot", () => { expect(createSlotSchema.safeParse(valid).success).toBe(true); });
});
