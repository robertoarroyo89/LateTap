import { describe, expect, it } from "vitest";

import { canCustomerHideReservation } from "@/server/services/reservation-service";

describe("customer reservation history", () => {
  const now = new Date("2026-08-17T12:00:00.000Z").getTime();

  it("keeps upcoming confirmed reservations visible", () => {
    expect(canCustomerHideReservation({ status: "confirmed", startAt: "2026-08-17T13:00:00.000Z" }, now)).toBe(false);
  });

  it("allows cancelled and past reservations to be hidden", () => {
    expect(canCustomerHideReservation({ status: "cancelled_by_customer", startAt: "2026-08-17T13:00:00.000Z" }, now)).toBe(true);
    expect(canCustomerHideReservation({ status: "confirmed", startAt: "2026-08-17T11:00:00.000Z" }, now)).toBe(true);
  });
});
