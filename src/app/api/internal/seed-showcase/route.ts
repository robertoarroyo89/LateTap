import { createHash, timingSafeEqual } from "node:crypto";

import { seedShowcaseData } from "@/server/showcase-seed";

const expectedTokenHash = "ca0e75a8daaa0db52eb989ef538554fc3512781edd1faa5bdca25b14fc76a9e5";

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV !== "production") return Response.json({ error: "Not available" }, { status: 404 });

  const suppliedHash = createHash("sha256").update((await request.text()).trim()).digest();
  const expectedHash = Buffer.from(expectedTokenHash, "hex");
  if (suppliedHash.length !== expectedHash.length || !timingSafeEqual(suppliedHash, expectedHash)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ data: await seedShowcaseData() }, { status: 201 });
}
