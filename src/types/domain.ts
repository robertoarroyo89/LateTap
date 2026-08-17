import type { CategoryId } from "@/config/categories";
import type { Locale } from "@/config/app";

export type ISODateString = string;
export type CurrencyCode = "EUR" | string;
export type UserRole = "customer" | "businessOwner";
export type BusinessStatus = "draft" | "submitted" | "pending_review" | "approved" | "rejected" | "suspended";
export type SlotStatus = "draft" | "published" | "reserved" | "completed" | "cancelled" | "expired";
export type ReservationStatus = "confirmed" | "cancelled_by_customer" | "cancelled_by_business" | "completed" | "no_show";

export interface Coordinates { latitude: number; longitude: number }

export interface Address {
  street: string;
  number: string;
  postalCode: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  neighborhood?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  photoURL?: string;
  preferredLocale: Locale;
  roles: UserRole[];
  defaultCity: string;
  businessIds?: string[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastLoginAt: ISODateString;
}

export interface PublicBusiness {
  id: string;
  name: string;
  slug: string;
  status: BusinessStatus;
  primaryCategoryId: CategoryId;
  categoryIds: CategoryId[];
  descriptionEs: string;
  descriptionEn?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  instagram?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  address: Address;
  location: Coordinates;
  geohash: string;
  timezone: string;
  currency: CurrencyCode;
  verified: boolean;
  showExactAddress: boolean;
}

export interface Business extends PublicBusiness {
  ownerUid: string;
  rejectionReason?: string;
  submittedAt?: ISODateString;
  approvedAt?: ISODateString;
  approvedBy?: string;
  termsAcceptedAt?: ISODateString;
  termsVersion?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Service {
  id: string;
  businessId: string;
  categoryId: CategoryId;
  nameEs: string;
  nameEn?: string;
  descriptionEs?: string;
  descriptionEn?: string;
  regularPriceCents: number;
  currency: CurrencyCode;
  durationMinutes: number;
  active: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface BusinessSnapshot {
  name: string;
  slug: string;
  logoUrl?: string;
  neighborhood: string;
  city: string;
}

export interface ServiceSnapshot {
  nameEs: string;
  nameEn?: string;
  categoryId: CategoryId;
}

export interface Slot {
  id: string;
  businessId: string;
  serviceId: string;
  categoryId: CategoryId;
  status: SlotStatus;
  startAt: ISODateString;
  endAt: ISODateString;
  timezone: string;
  durationMinutes: number;
  regularPriceCents: number;
  priceCents: number;
  currency: CurrencyCode;
  discountPercent: number;
  note?: string;
  reservationId?: string;
  location: Coordinates;
  geohash: string;
  cityKey: string;
  businessSnapshot: BusinessSnapshot;
  serviceSnapshot: ServiceSnapshot;
  publishedAt?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  cancelledAt?: ISODateString;
  completedAt?: ISODateString;
  distanceKm?: number;
}

export interface CustomerSnapshot { displayName: string; phone?: string; email: string }

export interface Reservation {
  id: string;
  slotId: string;
  businessId: string;
  customerUid: string;
  status: ReservationStatus;
  startAt: ISODateString;
  endAt: ISODateString;
  timezone: string;
  priceCents: number;
  currency: CurrencyCode;
  serviceSnapshot: ServiceSnapshot;
  businessSnapshot: BusinessSnapshot;
  customerSnapshot: CustomerSnapshot;
  createdAt: ISODateString;
  cancelledAt?: ISODateString;
  cancelledBy?: "customer" | "business";
  cancellationReason?: string;
  completedAt?: ISODateString;
  noShowAt?: ISODateString;
  hiddenFromCustomerAt?: ISODateString;
}

export type AlertDurationHours = 24 | 48 | 72;

export interface AlertPreference {
  id: string;
  uid: string;
  enabled: boolean;
  businessId?: string;
  categoryId?: CategoryId;
  location?: Coordinates;
  geohash?: string;
  radiusKm?: number;
  maxPriceCents?: number;
  datePreference?: "today" | "tomorrow" | "both" | "week";
  cityKey: string;
  durationHours: AlertDurationHours;
  expiresAt: ISODateString;
  lastMatchedAt?: ISODateString;
  matchCount?: number;
  locale: Locale;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface AvailabilityNotification {
  id: string;
  uid: string;
  type: "slot_available";
  alertId: string;
  slotId: string;
  categoryId: CategoryId;
  businessName: string;
  serviceName: string;
  startAt: ISODateString;
  locale: Locale;
  emailDelivered: boolean;
  readAt?: ISODateString;
  createdAt: ISODateString;
}

export interface PaginatedResult<T> { items: T[]; nextCursor?: string }
