# Firestore schema

Top-level collections:

- `users/{uid}` — customer profile, roles and locale; favourites live in `users/{uid}/favorites/{businessId}`.
- `businesses/{businessId}` — ownership, moderation status, address, location and public profile fields.
- `services/{serviceId}` — reusable services owned through `businessId`.
- `slots/{slotId}` — denormalised live inventory with business/service snapshots, geohash, canonical cents and lifecycle status.
- `reservations/{reservationId}` — immutable booking snapshots and status timestamps.
- `alerts/{alertId}` — future email/push alert preferences.
- `categories/{categoryId}` — enabled and ordered canonical categories.
- `reports/{reportId}` — moderation reports.
- `auditLogs/{logId}` — server-created moderation audit records.
- `platformConfig/{document}` — future server-controlled commercial configuration.

All money is integer cents. Appointment timestamps are Firestore timestamps and each record carries an explicit business timezone. Public slot documents duplicate the minimum business and service snapshot needed to avoid per-card reads.

Booking is one transaction: read slot, validate published/future, read approved business and customer, create the reservation snapshot, then mark the slot reserved. Customer cancellation transactionally republishes only a future slot. Business cancellation never republishes automatically.
