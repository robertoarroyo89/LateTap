import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { AppError, errorResponse } from "@/lib/errors";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { authenticateRequest } from "@/server/auth/session";
import { assertSameOrigin } from "@/server/security/origin";

const accepted = new Set(["image/jpeg", "image/png", "image/webp"]);
function hasValidSignature(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  return bytes.length > 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request); const user = await authenticateRequest(request); const form = await request.formData(); const file = form.get("file"); const kind = form.get("kind");
    if (!(file instanceof File) || (kind !== "logo" && kind !== "cover")) throw new AppError("INVALID_INPUT", "Invalid upload", 400);
    const limit = kind === "logo" ? 2 * 1024 * 1024 : 5 * 1024 * 1024; if (!accepted.has(file.type) || file.size > limit) throw new AppError("INVALID_INPUT", "Use JPEG, PNG or WebP within the size limit", 413);
    const bytes = new Uint8Array(await file.arrayBuffer()); if (!hasValidSignature(bytes, file.type)) throw new AppError("INVALID_INPUT", "File content does not match its image type", 422);
    const businesses = await adminDb().collection("businesses").where("ownerUid", "==", user.uid).limit(1).get(); if (businesses.empty) throw new AppError("FORBIDDEN", "Business ownership required", 403); const business = businesses.docs[0];
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"; const path = `businesses/${business.id}/${kind}/${randomUUID()}.${extension}`; const token = randomUUID(); const bucket = adminStorage().bucket(); await bucket.file(path).save(Buffer.from(bytes), { resumable: false, contentType: file.type, metadata: { metadata: { firebaseStorageDownloadTokens: token }, cacheControl: "public,max-age=31536000,immutable" } }); const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`; await business.ref.update({ [kind === "logo" ? "logoUrl" : "coverImageUrl"]: url, updatedAt: FieldValue.serverTimestamp() }); return Response.json({ data: { url } }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
