import { describe, expect, it } from "vitest";

import { calculateDiscount, formatPrice, localizedServiceName } from "@/lib/format";

describe("pricing integrity", () => {
  it("calculates the canonical discount on integer cents", () => { expect(calculateDiscount(3000, 2200)).toBe(27); });
  it("never accepts an inverted discount", () => { expect(calculateDiscount(2200, 3000)).toBe(0); });
  it("formats currency by locale", () => { expect(formatPrice(2200, "EUR", "es")).toContain("22"); });
});

describe("localization fallback", () => {
  it("uses Spanish when English is unavailable", () => { expect(localizedServiceName({ nameEs: "Masaje" }, "en")).toBe("Masaje"); });
});
