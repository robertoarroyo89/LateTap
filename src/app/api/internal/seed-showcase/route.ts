import { createHash, timingSafeEqual } from "node:crypto";

import { seedShowcaseData } from "@/server/showcase-seed";

const expectedTokenHash = "3905abdafead102ce6f6db41289b9e0ff8503bf32a872f61941576012f982ca5";

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV !== "production") return Response.json({ error: "Not available" }, { status: 404 });

  const suppliedHash = createHash("sha256").update((await request.text()).trim()).digest();
  const expectedHash = Buffer.from(expectedTokenHash, "hex");
  if (suppliedHash.length !== expectedHash.length || !timingSafeEqual(suppliedHash, expectedHash)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ data: await seedShowcaseData() }, { status: 201 });
}
