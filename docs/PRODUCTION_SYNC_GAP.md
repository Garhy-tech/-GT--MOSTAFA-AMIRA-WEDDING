# Production source sync guard

## Why this file exists

The current Vercel production deployment for `mostafa-amira-2026` is **not Git-connected**. Vercel reports the latest deployment source as `cli`, with deployment metadata showing `actor: codex` and no framework binding.

At the same time, the `main` branch of this GitHub repository contains an older static implementation whose markup, media references and visual system do not exactly match the currently published Vercel experience.

Therefore:

> **Do not merge this branch and point the production domain at GitHub until the exact current Vercel source/assets have been synchronized into the repository and visually regression-tested.**

## Production reference captured during productization

- Vercel team: `GARHY`
- Vercel project: `mostafa-amira-2026`
- Project ID: `prj_7r5uJUxlMQ6odx99vehYHYBIXJC3`
- Reference production deployment: `dpl_4f4Eed6xebXjMA8fX1jcVjRAH4bT`
- Reference alias: `mostafa-amira-2026.vercel.app`
- Deployment source: CLI
- Deployment state at inspection: READY

## Required sync procedure before production cutover

1. Preserve the live deployment and aliases as rollback references.
2. Obtain/export the exact source bundle that produced the current Vercel deployment.
3. Compare the bundle against GitHub `main`.
4. Import missing images, optimized AVIF/WebP variants, audio, icons, current CSS, current JS and Supabase client configuration pattern.
5. Remove obsolete placeholder-only sections from the older repository implementation.
6. Apply the GARHY INVITE productization layer on top of the synchronized source.
7. Create a Vercel Preview deployment from the feature branch.
8. Run mobile, desktop, RTL/LTR, RSVP, share, music, map, lifecycle and accessibility regression checks.
9. Only after approval: merge and attach the GARHY domain/portfolio route.

## Non-negotiable rule

The live wedding experience is a flagship reference and must remain reversible. Production domain changes are a separate release step from code productization.
