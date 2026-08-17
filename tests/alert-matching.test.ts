import { describe, expect, it } from "vitest";

import { alertMatchesSlot } from "@/server/services/alert-service";
import type { AlertPreference, Slot } from "@/types/domain";

const now = new Date("2026-08-17T10:00:00.000Z");
const alert = {
  enabled: true,
  expiresAt: "2026-08-19T10:00:00.000Z",
  categoryId: "hair",
  cityKey: "valencia",
  location: { latitude: 39.4699, longitude: -0.3763 },
  radiusKm: 5,
  maxPriceCents: 3500,
  datePreference: "both",
} satisfies Pick<AlertPreference, "enabled" | "expiresAt" | "categoryId" | "cityKey" | "location" | "radiusKm" | "maxPriceCents" | "datePreference">;

const slot = {
  businessId: "business-1",
  categoryId: "hair",
  cityKey: "valencia",
  location: { latitude: 39.47, longitude: -0.376 },
  priceCents: 2800,
  startAt: "2026-08-17T17:00:00.000Z",
  timezone: "Europe/Madrid",
} satisfies Pick<Slot, "businessId" | "categoryId" | "cityKey" | "location" | "priceCents" | "startAt" | "timezone">;

describe("availability alert matching", () => {
  it("matches an active alert with the same filters", () => {
    expect(alertMatchesSlot(alert, slot, now)).toBe(true);
  });

  it("rejects expired, distant, expensive, and different-category slots", () => {
    expect(alertMatchesSlot({ ...alert, expiresAt: "2026-08-17T09:00:00.000Z" }, slot, now)).toBe(false);
    expect(alertMatchesSlot(alert, { ...slot, location: { latitude: 40.4168, longitude: -3.7038 } }, now)).toBe(false);
    expect(alertMatchesSlot(alert, { ...slot, priceCents: 5000 }, now)).toBe(false);
    expect(alertMatchesSlot(alert, { ...slot, categoryId: "nails" }, now)).toBe(false);
  });
});
