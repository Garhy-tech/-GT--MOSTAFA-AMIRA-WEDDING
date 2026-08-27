# GARHY Invite

**GARHY Invite** is the premium digital-invitations and event-experiences product by **GARHY TECH**.

## Flagship event

**Mostafa & Amira 2026** is the first flagship event case built on GARHY Invite. The couple/event name remains guest-facing event identity; it is no longer treated as the institutional product name.

## Brand architecture

```text
GARHY TECH
└── GARHY Invite
    └── Mostafa & Amira 2026
```

## Release architecture

- `app-v2/` — canonical GARHY Invite guest experience for the current flagship event.
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
- Reusable schema for weddings, engagements, birthdays, conferences, openings and other events
- Mobile-first responsive experience and reduced-motion accessibility support

## Naming rule

Use **GARHY Invite** for the platform/product, reusable engine, institutional documentation and future corporate routes.

Use **Mostafa & Amira 2026** only for the specific event configuration, guest-facing invitation, analytics/event records and historical rollback identifiers.

## Release rule

The existing Vercel production alias is not changed by this identity update. Domain binding, Vercel project renaming and production promotion remain separate release steps after preview QA, so existing invitation links and rollback anchors stay intact.
