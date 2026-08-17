import { FieldValue, GeoPoint, Timestamp } from "firebase-admin/firestore";
import { distanceBetween } from "geofire-common";

import { featureFlags } from "@/config/features";
import { adminDb } from "@/lib/firebase/admin";
import { emailProvider } from "@/server/providers/email";
import type { AlertPreference, Coordinates, Slot } from "@/types/domain";

type StoredAlert = Omit<AlertPreference, "createdAt" | "updatedAt" | "expiresAt" | "lastMatchedAt" | "location"> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp;
  lastMatchedAt?: Timestamp;
  location?: GeoPoint | Coordinates;
};

function timestampToIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return undefined;
}

function coordinates(value: StoredAlert["location"]): Coordinates | undefined {
  if (!value) return undefined;
  return {
    latitude: value.latitude,
    longitude: value.longitude,
  };
}

export function serializeAlert(id: string, data: FirebaseFirestore.DocumentData): AlertPreference {
  return {
    ...data,
    id,
    location: coordinates(data.location),
    createdAt: timestampToIso(data.createdAt) ?? new Date(0).toISOString(),
    updatedAt: timestampToIso(data.updatedAt) ?? new Date(0).toISOString(),
    expiresAt: timestampToIso(data.expiresAt) ?? new Date(0).toISOString(),
    lastMatchedAt: timestampToIso(data.lastMatchedAt),
  } as AlertPreference;
}

function dateKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function allowedDate(alert: Pick<AlertPreference, "datePreference">, slot: Pick<Slot, "startAt" | "timezone">, now: Date): boolean {
  if (!alert.datePreference || alert.datePreference === "week") return true;
  const today = dateKey(now, slot.timezone);
  const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrow = dateKey(tomorrowDate, slot.timezone);
  const slotDate = dateKey(new Date(slot.startAt), slot.timezone);
  if (alert.datePreference === "today") return slotDate === today;
  if (alert.datePreference === "tomorrow") return slotDate === tomorrow;
  return slotDate === today || slotDate === tomorrow;
}

export function alertMatchesSlot(
  alert: Pick<AlertPreference, "enabled" | "expiresAt" | "businessId" | "categoryId" | "cityKey" | "location" | "radiusKm" | "maxPriceCents" | "datePreference">,
  slot: Pick<Slot, "businessId" | "categoryId" | "cityKey" | "location" | "priceCents" | "startAt" | "timezone">,
  now = new Date(),
): boolean {
  if (!alert.enabled || new Date(alert.expiresAt).getTime() <= now.getTime()) return false;
  if (alert.businessId && alert.businessId !== slot.businessId) return false;
  if (alert.categoryId && alert.categoryId !== slot.categoryId) return false;
  if (alert.cityKey && alert.cityKey !== slot.cityKey) return false;
  if (alert.maxPriceCents && slot.priceCents > alert.maxPriceCents) return false;
  if (!allowedDate(alert, slot, now)) return false;
  if (alert.location && alert.radiusKm) {
    const distanceKm = distanceBetween(
      [alert.location.latitude, alert.location.longitude],
      [slot.location.latitude, slot.location.longitude],
    );
    if (distanceKm > alert.radiusKm) return false;
  }
  return true;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]!);
}

function isAlreadyExists(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  return code === 6 || code === "already-exists";
}

export async function notifyMatchingAlerts(slot: Slot): Promise<number> {
  const db = adminDb();
  const snapshot = await db.collection("alerts").where("enabled", "==", true).limit(500).get();
  const now = new Date();
  const matches = snapshot.docs
    .map((document) => ({ ref: document.ref, alert: serializeAlert(document.id, document.data()) }))
    .filter(({ alert }) => alertMatchesSlot(alert, slot, now));

  let created = 0;
  for (const { ref, alert } of matches) {
    const notificationId = `${alert.id}_${slot.id}`;
    const notificationRef = db.collection("notifications").doc(notificationId);
    try {
      await notificationRef.create({
        id: notificationId,
        uid: alert.uid,
        type: "slot_available",
        alertId: alert.id,
        slotId: slot.id,
        categoryId: slot.categoryId,
        businessName: slot.businessSnapshot.name,
        serviceName: alert.locale === "en" && slot.serviceSnapshot.nameEn
          ? slot.serviceSnapshot.nameEn
          : slot.serviceSnapshot.nameEs,
        startAt: Timestamp.fromDate(new Date(slot.startAt)),
        locale: alert.locale,
        emailDelivered: false,
        readAt: null,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      if (isAlreadyExists(error)) continue;
      throw error;
    }

    created += 1;
    await ref.update({
      lastMatchedAt: FieldValue.serverTimestamp(),
      matchCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (!featureFlags.emailAlerts) continue;
    const profile = await db.collection("users").doc(alert.uid).get();
    const recipient = profile.data()?.email;
    if (typeof recipient !== "string" || !recipient) continue;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const slotUrl = `${appUrl}/${alert.locale}/slot/${slot.id}`;
    const spanish = alert.locale === "es";
    const result = await emailProvider.send({
      to: recipient,
      subject: spanish ? "Acaba de aparecer una cita para ti" : "A matching appointment just opened up",
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#171717"><p style="color:#e34c56;font-weight:700">LateTap</p><h1 style="font-size:28px">${spanish ? "Algo acaba de quedar libre." : "Something just opened up."}</h1><p><strong>${escapeHtml(slot.businessSnapshot.name)}</strong><br>${escapeHtml(alert.locale === "en" && slot.serviceSnapshot.nameEn ? slot.serviceSnapshot.nameEn : slot.serviceSnapshot.nameEs)}</p><p><a href="${escapeHtml(slotUrl)}" style="display:inline-block;background:#171717;color:white;padding:13px 18px;border-radius:9px;text-decoration:none;font-weight:700">${spanish ? "Ver y reservar" : "View and book"}</a></p><p style="color:#707070;font-size:12px">${spanish ? "Recibes este correo porque creaste un aviso de disponibilidad en LateTap." : "You received this email because you created an availability alert on LateTap."}</p></div>`,
      idempotencyKey: `availability-${notificationId}`,
    });
    if (result.delivered) await notificationRef.update({ emailDelivered: true });
  }
  return created;
}
