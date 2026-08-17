import { afterEach, describe, expect, it } from "vitest";

import { assertSameOrigin } from "@/server/security/origin";

const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;

afterEach(() => {
  if (previousAppUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
  else process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
});

describe("same-origin protection", () => {
  it("accepts the current deployment and configured canonical origins", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://late-tap.vercel.app";
    expect(() => assertSameOrigin(new Request("http://internal:3000/api/test", { headers: { origin: "http://localhost:3000", host: "localhost:3000" } }))).not.toThrow();
    expect(() => assertSameOrigin(new Request("https://preview.example/api/test", { headers: { origin: "https://late-tap.vercel.app" } }))).not.toThrow();
  });

  it("rejects requests from unrelated origins", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://late-tap.vercel.app";
    expect(() => assertSameOrigin(new Request("https://late-tap.vercel.app/api/test", { headers: { origin: "https://malicious.example" } }))).toThrow("Invalid request origin");
  });
});
