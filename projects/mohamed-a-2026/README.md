# GARHY Invite — MOHAMED × A — Festival Edition

Independent GARHY Invite client event experience. This project does **not** modify or depend on the Mostafa & Amira guest application.

## Event facts

- Groom: `MOHAMED`
- Bride display identity: `A`
- Henna night: Thursday, 03 September 2026
- Henna location: intentionally pending
- Wedding night: Friday, 04 September 2026
- Wedding venue: Shahrazad Hall, Sinnuris, Faiyum
- RSVP / attendance confirmation / decline flow: disabled by product requirement

## Creative direction

`Shaabi Luxe / Festival Mode`: high-energy dark event identity using controlled fireworks, stage lasers, fire-red/orange highlights, metallic gold accents, kinetic typography, festival ticker motion and optional user-initiated percussion pulses. No autoplay audio.

## Interaction contract

- Cinematic entry gate with keyboard-accessible entry.
- Date-only wedding countdown until the start of 04 September 2026 in Cairo time; event start time remains intentionally unspecified.
- Add-to-calendar files for both dates.
- Henna venue renders as pending and has no map action.
- Wedding map action uses the approved Shahrazad Hall pin.
- Native share where supported, clipboard fallback otherwise.
- Motion respects `prefers-reduced-motion`.
- User-initiated WebAudio only; no remote audio asset or autoplay.

## Release-candidate performance contract

- No framework runtime.
- No remote fonts, images, videos or third-party critical-path resources.
- Current static release payload is approximately 42 KB uncompressed across HTML, CSS, JavaScript, event config and Vercel config, with a CI ceiling of 75 KB.
- Multi-viewport QA covers 320, 390, 430, 768, 1024 and 1440 widths.
- CI blocks horizontal overflow, hero-name clipping, serious/critical accessibility violations, browser console/page errors and external resource regressions.

## Preview security contract

- Isolated Vercel review project only.
- Release is assembled and deployed outside the Wedding repository root to prevent configuration inheritance.
- Strict CSP, `no-store`, `noindex`, frame denial, COOP/CORP and restrictive Permissions Policy are verified against the deployed edge response.
- Vercel Preview Feedback injection is disabled.
- No Supabase dependency or guest data collection.
- No production GARHY domain or existing Mostafa & Amira Vercel alias is changed by preview deployment.

## Release rule

Keep the pull request Draft and preview-only until explicit approval for production deployment and final event details, including the henna location and any event start times, are supplied.
