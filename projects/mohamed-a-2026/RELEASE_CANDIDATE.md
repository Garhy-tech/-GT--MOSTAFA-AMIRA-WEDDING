# MOHAMED × A — Release Candidate Acceptance Matrix

Status: preview-only release candidate.

## Functional
- [x] Cinematic entry experience
- [x] Henna date: Thursday 03/09/2026
- [x] Henna location deliberately pending
- [x] Wedding date: Friday 04/09/2026
- [x] Wedding venue: Shahrazad Hall, Sinnuris, Faiyum
- [x] Correct approved map coordinates
- [x] Add-to-calendar for both dates, including generated ICS content validation
- [x] Native share with clipboard fallback, including functional browser validation
- [x] User-initiated beat only; no autoplay audio
- [x] No RSVP / attendance confirmation / decline flow
- [x] No form controls or guest-data collection

## Visual / browser
- [x] Android/touch simulation at 280 px
- [x] Android/touch simulation at 320 px
- [x] Android/touch simulation at 360 px
- [x] Android/touch simulation at 390 px
- [x] Android/touch simulation at 412 px
- [x] Android/touch simulation at 430 px
- [x] 768 px tablet
- [x] 1024 px desktop
- [x] 1440 px desktop
- [x] No horizontal overflow
- [x] Intro MOHAMED × A typography remains inside both viewport and intro-card bounds
- [x] Hero MOHAMED typography remains inside viewport bounds
- [x] Touch interactions remain at least 44 px while animated
- [x] Real viewport captures for hero, countdown, henna card, wedding card, festival drop, and finale
- [x] No browser console, page, request, or same-origin HTTP errors
- [x] Reduced-motion behavior verified
- [x] Zero serious/critical Axe accessibility violations

## Performance
- [x] Framework-free static release
- [x] Zero third-party critical-path requests
- [x] No remote fonts/images/video
- [x] Static payload guarded below 75 KB uncompressed
- [x] Lighthouse mobile: Performance 100 / Accessibility 100 / Best Practices 100
- [x] Lighthouse desktop: Performance 100 / Accessibility 100 / Best Practices 100
- [x] SEO intentionally excluded from the review score because preview is noindex by policy

## Preview security
- [x] Dedicated Vercel review project
- [x] Non-production deployment target after project bootstrap
- [x] Release assembled outside legacy Wedding Git root
- [x] Preview Feedback injection disabled
- [x] Strict CSP verified at Vercel edge
- [x] `Cache-Control: no-store` verified
- [x] `X-Robots-Tag: noindex` verified
- [x] Legacy Google Fonts and Supabase allowances absent
- [x] Mostafa & Amira project and aliases untouched

Overall release acceptance: 100/100 only when every enforced gate above is green on the same release head.

Production release remains blocked until explicit approval and any missing event details are supplied.
