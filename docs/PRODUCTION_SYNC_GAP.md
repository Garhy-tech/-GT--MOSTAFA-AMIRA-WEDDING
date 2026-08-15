# Production cutover guard

## Current deployment state

The live Vercel project `mostafa-amira-2026` was deployed through the CLI and is intentionally left untouched during GARHY INVITE development.

Reference deployment retained as the approved visual/media origin:

- Project: `mostafa-amira-2026`
- Project ID: `prj_7r5uJUxlMQ6odx99vehYHYBIXJC3`
- Immutable deployment: `mostafa-amira-2026-rbi4w8d0t-garhy.vercel.app`
- Deployment ID: `dpl_4f4Eed6xebXjMA8fX1jcVjRAH4bT`

## Development strategy

`app-v2` is source-controlled independently from the old static implementation. It references the approved media and base stylesheet from the immutable Vercel deployment URL, not from the mutable production alias. This prevents missing media while keeping the legacy application fully recoverable.

The old `index.html`, `assets/` implementation and production alias remain rollback references until final cutover.

## Final release gate

Before a GARHY domain is attached:

1. Deploy `app-v2` as a Vercel Preview.
2. Validate mobile/desktop, Arabic/English, reduced motion, gallery, music, calendar, map, lifecycle and personalized invitation routing.
3. Activate a persistent Supabase project and apply `supabase/migrations/202608150001_garhy_invite_core.sql`.
4. Test private token resolution, RSVP, guest limits and pass issuance end-to-end.
5. Migrate immutable media to GARHY-owned object storage/CDN if desired.
6. Promote the approved Preview.
7. Attach the GARHY domain only after the promoted deployment is verified.

No domain or current production alias should be changed during development.
