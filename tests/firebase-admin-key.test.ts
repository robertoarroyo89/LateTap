import { describe, expect, it } from "vitest";

import { normalizeFirebasePrivateKey } from "@/lib/firebase/admin";

const pem = "-----BEGIN PRIVATE KEY-----\nexample\n-----END PRIVATE KEY-----\n";

describe("Firebase Admin private key normalization", () => {
  it("keeps a multiline PEM value intact", () => {
    expect(normalizeFirebasePrivateKey(pem)).toBe(pem.trim());
  });

  it("decodes a JSON string value", () => {
    expect(normalizeFirebasePrivateKey(JSON.stringify(pem))).toBe(pem);
  });

  it("extracts the private key from a service account JSON object", () => {
    expect(normalizeFirebasePrivateKey(JSON.stringify({ private_key: pem }))).toBe(pem);
  });

  it("decodes escaped newlines from an unquoted value", () => {
    expect(normalizeFirebasePrivateKey(pem.replace(/\n/g, "\\n"))).toBe(pem);
  });
});
