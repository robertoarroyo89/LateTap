import { FieldValue, GeoPoint } from "firebase-admin/firestore";
import { geohashForLocation } from "geofire-common";

import { appConfig } from "@/config/app";
import { AppError } from "@/lib/errors";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { slugify } from "@/lib/slug";
import type { z } from "zod";
import type { businessOnboardingSchema, moderationSchema } from "@/lib/validation/businesses";

type OnboardingInput = z.infer<typeof businessOnboardingSchema>;
type ModerationInput = z.infer<typeof moderationSchema>;

export class BusinessService {
  async submit(ownerUid: string, input: OnboardingInput) {
    const db = adminDb();
    const businessRef = db.collection("businesses").doc();
    const serviceRef = db.collection("services").doc();
    const baseSlug = slugify(input.name);
    const duplicate = await db.collection("businesses").where("slug", "==", baseSlug).limit(1).get();
    const slug = duplicate.empty ? baseSlug : `${baseSlug}-valencia-${businessRef.id.slice(0, 5)}`;
    const batch = db.batch();
    batch.create(businessRef, {
      id: businessRef.id, ownerUid, name: input.name, slug, status: "pending_review", primaryCategoryId: input.primaryCategoryId, categoryIds: [input.primaryCategoryId],
      descriptionEs: input.descriptionEs, email: input.email, phone: input.phone, whatsapp: input.whatsapp ?? "", website: input.website ?? "", instagram: input.instagram ?? "",
      logoUrl: "", coverImageUrl: "", address: input.address,
      location: new GeoPoint(input.location.latitude, input.location.longitude), geohash: geohashForLocation([input.location.latitude, input.location.longitude]),
      timezone: appConfig.defaultTimezone, currency: appConfig.defaultCurrency, verified: false, showExactAddress: input.showExactAddress,
      submittedAt: FieldValue.serverTimestamp(), termsAcceptedAt: FieldValue.serverTimestamp(), termsVersion: appConfig.legalVersion, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
    batch.create(serviceRef, { id: serviceRef.id, businessId: businessRef.id, ...input.firstService, currency: appConfig.defaultCurrency, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    batch.set(db.collection("users").doc(ownerUid), { roles: FieldValue.arrayUnion("businessOwner"), businessIds: FieldValue.arrayUnion(businessRef.id), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    await batch.commit();
    const user = await adminAuth().getUser(ownerUid);
    await adminAuth().setCustomUserClaims(ownerUid, { ...user.customClaims, roles: [...new Set([...(Array.isArray(user.customClaims?.roles) ? user.customClaims.roles : ["customer"]), "businessOwner"])] });
    return { id: businessRef.id, status: "pending_review" };
  }

  async moderate(adminUid: string, businessId: string, input: ModerationInput) {
    const db = adminDb(); const ref = db.collection("businesses").doc(businessId); const snapshot = await ref.get();
    if (!snapshot.exists) throw new AppError("NOT_FOUND", "Business not found", 404);
    const status = input.action === "approve" || input.action === "restore" ? "approved" : input.action === "reject" ? "rejected" : "suspended";
    const update: Record<string, unknown> = { status, verified: status === "approved", updatedAt: FieldValue.serverTimestamp() };
    if (input.action === "approve" || input.action === "restore") { update.approvedAt = FieldValue.serverTimestamp(); update.approvedBy = adminUid; update.rejectionReason = FieldValue.delete(); }
    if (input.action === "reject") { update.rejectedAt = FieldValue.serverTimestamp(); update.rejectionReason = input.reason; }
    await db.runTransaction(async (transaction) => { transaction.update(ref, update); const auditRef = db.collection("auditLogs").doc(); transaction.create(auditRef, { adminUid, action: `business_${input.action}`, entityType: "business", entityId: businessId, metadata: { reason: input.reason ?? null }, createdAt: FieldValue.serverTimestamp() }); });
    return { id: businessId, status };
  }
}
