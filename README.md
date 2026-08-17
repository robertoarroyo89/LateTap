# LateTap

**Last minute. Right on time.**

LateTap is a mobile-first marketplace for appointment times that become available unexpectedly. A local business publishes a cancellation, someone nearby discovers it, taps and books it, then pays directly at the venue.

The MVP launches in Valencia with beauty, personal care and wellness categories. It is intentionally positioned around **live last-minute availability**, not coupons or discounts.

## What is included

- Spanish and English marketplace routes.
- Public discovery, URL-based filters and opt-in browser geolocation.
- Business and temporary slot detail pages with appropriate SEO policy.
- Firebase email/password and Google authentication with secure web session cookies.
- Versioned `/api/v1` endpoints that also accept Firebase Bearer tokens for a future iOS app.
- Atomic Firestore booking, customer cancellation and business completion/no-show/cancellation.
- Five-step business onboarding and admin approval/rejection/suspension service.
- Reusable service catalogue and 15–30 second slot publisher with price presets.
- Customer bookings, profile, favourites, alerts, logout and integrity-safe account deletion.
- Business inventory, bookings and recovered-revenue dashboard.
- Admin moderation, reports and category controls protected by Firebase custom claims and audit logs.
- Validated logo and cover uploads through Firebase Storage.
- Firestore/Storage rules, composite indexes, emulator configuration and deterministic seed data.
- PWA manifest, localized metadata, sitemap, robots, Open Graph image and security headers.
- Unit, Firestore transaction integration and Playwright smoke tests.
- GitHub Actions quality workflow and Vercel-ready configuration.

## Architecture

```text
Web UI / future iOS app
        ↓
Versioned API and server entry points
        ↓
Application services
        ↓
Repository/provider interfaces
        ↓
Firebase Auth · Firestore · Storage
```

The browser never decides a reservation price, discount, owner, moderation status or lifecycle transition. Sensitive writes go through authenticated server endpoints. Public pages receive explicit domain DTOs rather than raw Firestore documents.

See [architecture](docs/architecture.md) and [Firestore schema](docs/firestore-schema.md).

## Requirements

- Node.js 22
- npm
- A Firebase development project for connected mode
- Java 11+ when using the Firebase Emulator Suite

Without Firebase variables, public pages use clearly fictional in-process development inventory. Production never treats that inventory as real Firestore data. Account, booking and dashboard writes remain disabled until Firebase is configured.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The root redirects to `/es` or `/en` using the saved/browser preference, with Spanish as fallback.

### Firebase Web SDK

Create a Firebase web application and copy its values into:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Enable Authentication providers:

1. Email/password.
2. Google.
3. Add `localhost` and the production Vercel/custom domain under authorized domains.

Apple sign-in is deliberately prepared as a future provider and is not required for v1.

### Firebase Admin SDK

Create a service account restricted to the correct development project and set:

```text
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

On Vercel, preserve the private key as one environment value with escaped `\n` line breaks. Never add a service-account JSON or secret to Git.

## Firebase emulators

Start Auth, Firestore, Storage and the Emulator UI:

```bash
npm run emulators
```

In another terminal:

```bash
export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
export FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
export FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
export FIREBASE_ADMIN_PROJECT_ID=demo-latetap
npm run seed
```

Set `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true` in `.env.local` for the browser SDK.

The deterministic emulator seed creates:

- 8 canonical categories.
- 10 fictional Valencia businesses.
- 10 services.
- 40 future appointment slots.
- Customer, business and admin emulator accounts.

Emulator-only password: `DemoPass!2026`

```text
customer@demo.latetap.test
business@demo.latetap.test
admin@demo.latetap.test
```

The seed refuses to touch a remote project unless `ALLOW_REMOTE_SEED=true` is explicitly supplied. Never seed a production project.

## First admin

Create the user normally in Firebase Authentication, copy their UID, then run from a trusted environment with Admin credentials:

```bash
ADMIN_UID=<firebase-uid> npm run admin:set
```

The command sets a secure Firebase custom claim. A user document field cannot grant admin access. The user must sign out and back in to refresh their token.

## First real business

1. Sign in as a normal user.
2. Open `/{locale}/business-onboarding` and submit the five-step form.
3. Sign in as an admin and open `/{locale}/admin`.
4. Review and approve the pending business.
5. The owner signs in again if their role claim was added during the session.
6. Add services and publish the first appointment in the business dashboard.

Only approved businesses can publish public slots; this is enforced server-side even if a client bypasses the interface.

## Tests and checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Run the Firestore concurrency test against the emulator:

```bash
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
FIREBASE_ADMIN_PROJECT_ID=demo-latetap \
npm test
```

Run browser journeys:

```bash
npx playwright install
npm run test:e2e
```

The critical transaction integration test starts two customers against one slot and verifies that exactly one succeeds.

## Deploy Firebase configuration

Copy `.firebaserc.example` to `.firebaserc`, replace the development placeholder, and keep the production project selection deliberate.

```bash
npx firebase-tools deploy --only firestore:rules
npx firebase-tools deploy --only firestore:indexes
npx firebase-tools deploy --only storage
```

Vercel deploys the Next.js application; it does not deploy Firebase rules or indexes.

## Deploy to Vercel

1. Import the GitHub repository in Vercel.
2. Select Node.js 22 and the default Next.js build command.
3. Add every required production environment variable.
4. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS origin.
5. Add the Vercel and custom domains to Firebase Authentication authorized domains.
6. Deploy Firestore rules, indexes and Storage rules separately.
7. Create the first admin via custom claims.
8. Replace every legal placeholder before commercial use.

No Mapbox token is required: list discovery and provider-neutral directions remain functional. No email key is required: booking remains successful even if transactional email is unavailable.

## Environment variables

The authoritative template is [.env.example](.env.example).

- `NEXT_PUBLIC_APP_URL` — canonical public origin.
- `NEXT_PUBLIC_FIREBASE_*` — public Firebase web configuration.
- `FIREBASE_ADMIN_*` — private server credentials.
- `NEXT_PUBLIC_MAPBOX_TOKEN` — optional future map view.
- `RESEND_API_KEY`, `EMAIL_FROM` — optional transactional email.
- `FEATURE_*` — centralized disabled-by-default product capabilities.

Future payments, subscriptions, reviews, push notifications and promoted slots are disabled. The `PaymentProvider` currently resolves to `NoPaymentProvider`; customers pay at the venue.

## Production checklist

- [ ] Separate production Firebase project created.
- [ ] Firestore region selected appropriately for Spain/Europe.
- [ ] Email/password and Google authentication enabled.
- [ ] Production and custom domains authorized in Firebase Auth.
- [ ] Firestore rules deployed and tested.
- [ ] Firestore indexes deployed and finished building.
- [ ] Storage rules deployed.
- [ ] Firebase App Check configured and monitored before enforcement.
- [ ] First admin custom claim created.
- [ ] Vercel production variables configured.
- [ ] `NEXT_PUBLIC_APP_URL` uses the final HTTPS domain.
- [ ] Development seed is not present in production.
- [ ] Legal company placeholders replaced after professional review.
- [ ] Optional email sending domain verified.
- [ ] Optional map token domain-restricted.
- [ ] Error monitoring configured if desired.
- [ ] Mobile journeys checked on iOS Safari and Android Chrome.
- [ ] Booking concurrency integration test passed against emulators.
- [ ] Business approval, slot publishing, booking, cancellation and completion rehearsed.

## Future iOS and payments

A native client should authenticate with Firebase and send its ID token as a Bearer token to `/api/v1`. It can reuse the same service semantics and Firestore backend without adopting browser session cookies.

Future online payments should be added behind `PaymentProvider`, likely with Stripe Connect. Do not mark a slot reserved before confirmed payment in that future flow. The current MVP intentionally remains: reserve → attend → pay at venue → business marks completed.

## Legal status

All legal pages are professional structural placeholders, not legal advice. `[LEGAL COMPANY NAME]`, `[TAX ID]`, `[REGISTERED ADDRESS]` and `[CONTACT EMAIL]` must be completed and reviewed before launch.
