function enabled(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

export const featureFlags = {
  payments: enabled(process.env.FEATURE_PAYMENTS),
  businessSubscriptions: enabled(process.env.FEATURE_BUSINESS_SUBSCRIPTIONS),
  reviews: enabled(process.env.FEATURE_REVIEWS),
  pushNotifications: enabled(process.env.FEATURE_PUSH_NOTIFICATIONS),
  promotedSlots: enabled(process.env.FEATURE_PROMOTED_SLOTS),
  map: enabled(process.env.FEATURE_MAPS, Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN)),
  emailAlerts: enabled(process.env.FEATURE_EMAIL, Boolean(process.env.RESEND_API_KEY)),
  requireDiscount: enabled(process.env.FEATURE_REQUIRE_DISCOUNT),
} as const;
