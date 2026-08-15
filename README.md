# GARHY INVITE — Mostafa & Amira

Flagship premium digital-event experience by **GARHY TECH**.

## Release architecture

- `app-v2/` — canonical GARHY INVITE guest experience.
- `platform/` — reusable event schema, examples and runtime core.
- `supabase/migrations/` — private RSVP / guest / invitation / pass backend contract.
- `assets/`, legacy `index.html` and legacy `assets/js/app.js` — preserved rollback implementation.
- `vercel.json` — routes a future deployment to V2 without changing the current live domain during development.

## Asset strategy

V2 references the immutable production deployment `mostafa-amira-2026-rbi4w8d0t-garhy.vercel.app` for the approved wedding media and base visual stylesheet. This preserves exact existing media quality while source control is modernized. Asset migration to GARHY-owned storage/CDN is intentionally part of the final domain/cutover phase.

## Product capabilities

- Arabic / English experience with RTL/LTR support
- Event lifecycle: upcoming, final countdown, live, thank-you, archive
- Personalized invitation tokens
- Secure token-backed RSVP API contract
- Guest-count limits and RSVP editing
- Digital guest-pass issuance primitive
- Calendar, sharing, maps, music and gallery interactions
- Privacy-conscious event telemetry
- Reusable schema for weddings, birthdays, conferences, openings and other events
- Mobile-first responsive experience and reduced-motion accessibility support

## Release rule

The existing Vercel production alias is not changed by source merges. Domain binding and production promotion are a separate final release step after preview QA and backend activation.
