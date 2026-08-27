# MOHAMED × A — Release Candidate Acceptance Matrix

Status: preview-only release candidate.

## Functional
- [x] Cinematic entry experience
- [x] Henna date: Thursday 03/09/2026
- [x] Henna location deliberately pending
- [x] Wedding date: Friday 04/09/2026
- [x] Wedding venue: Shahrazad Hall, Sinnuris, Faiyum
- [x] Correct approved map coordinates
- [x] Add-to-calendar for both dates
- [x] Native share with clipboard fallback
- [x] User-initiated beat only
- [x] No RSVP / attendance confirmation / decline flow

## Visual / browser
- [x] 320 px
- [x] 390 px
- [x] 430 px
- [x] 768 px
- [x] 1024 px
- [x] 1440 px
- [x] No horizontal overflow
- [x] MOHAMED hero typography remains inside viewport bounds
- [x] No browser console or page errors
- [x] Reduced-motion behavior verified
- [x] Zero serious/critical Axe accessibility violations

## Performance
- [x] Framework-free static release
- [x] Zero third-party critical-path requests
- [x] No remote fonts/images/video
- [x] Static payload guarded below 75 KB uncompressed

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

Production release remains blocked until explicit approval and any missing event details are supplied.
