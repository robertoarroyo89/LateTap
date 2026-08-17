# LateTap architecture

```text
Next.js UI / future iOS client
          |
          v
Versioned API (/api/v1) and server actions
          |
          v
Application services (booking, business, slots)
          |
          v
Repository and provider interfaces
          |
          v
Firebase Auth + Firestore + Storage
```

The browser uses Firebase Authentication only to obtain an ID token. The web application exchanges it for an HttpOnly session cookie. Native clients can call the same `/api/v1` endpoints with `Authorization: Bearer <Firebase ID token>`.

Public pages use explicit DTOs and server repositories rather than exposing raw Firestore documents. Booking, price calculation, ownership checks, approval and status transitions run on the server. Firestore transactions are the final authority for live inventory.

Firebase remains the backend so a native iOS client can share authentication and data. Domain services do not import React and the web UI does not own business rules.
