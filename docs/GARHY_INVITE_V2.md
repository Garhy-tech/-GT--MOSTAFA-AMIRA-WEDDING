# GARHY INVITE — Productization Plan

## Status

This repository contains the original Mostafa & Amira wedding experience and is now the flagship reference implementation for **GARHY INVITE**, a reusable premium digital-event platform by GARHY TECH.

The legacy experience must remain recoverable. Product work is developed on feature branches and validated before any production-domain switch.

## Product definition

GARHY INVITE is not a collection of event landing pages. It is an event-experience engine that renders a premium invitation from structured event data and adapts its behavior across the event lifecycle.

Supported event families:

- Wedding and engagement
- Birthday and private celebration
- Conference and summit
- Grand opening and product launch
- Graduation and ceremony
- VIP and corporate event

## Core capabilities

### 1. Event lifecycle

Every event automatically resolves to one of five states:

- `upcoming`
- `final-countdown`
- `live`
- `thank-you`
- `archive`

UI, copy and CTAs are allowed to change by lifecycle state. After an event, RSVP should close and the invitation should become a memory/recap experience instead of remaining a stale registration page.

### 2. Guest personalization

Public event identity and private guest identity are separate concerns.

Production guest links should use an opaque invite token, for example:

`/i/7f2f6f8d...`

Guest names must not be encoded in public URLs in the final production architecture. The current static implementation supports a guest-name query only as a backwards-compatible prototype while the token lookup service is being built.

### 3. Smart RSVP

The event engine should support:

- attending / declining / pending
- allowed guest count
- companion data
- optional dietary or event-specific questions
- response timestamps
- response editing rules
- lifecycle-based RSVP closing
- CSV export from the admin experience

### 4. Guest pass

An accepted RSVP can create a deterministic event pass record. The UI layer may later render the pass as a QR code. The QR payload must reference a server-verifiable pass identifier rather than trusting client-provided guest details.

### 5. Adaptive sections

Sections are selected by event type and config, not hard-coded globally.

Examples:

**Wedding**
`Blessing → Couple → Countdown → Story → Details → Gallery → Venue → RSVP`

**Conference**
`Brand → Speakers → Agenda → Venue → Registration → Pass`

**Opening**
`Brand → Opening Message → Schedule → Location → VIP RSVP → Contact`

**Birthday**
`Hero → Story/Gallery → Date → Venue → RSVP → Wishes`

## Architecture target

The current static site remains the compatibility layer. The target product architecture is:

```text
/apps
  /invite       public guest experience
  /studio       event/admin management
/packages
  /event-core   schemas, lifecycle and validation
  /ui           reusable premium components
  /themes       visual systems per event family
  /rsvp         RSVP contracts and adapters
  /passes       guest-pass primitives
  /i18n         Arabic/English locale resources
  /analytics    privacy-conscious event telemetry
```

Recommended runtime stack for the product phase:

- Next.js App Router + TypeScript
- Supabase/PostgreSQL for event, guest and RSVP records
- Vercel for preview/production delivery
- Object storage/CDN for event media
- Server-side invite-token resolution
- Server-side QR/pass verification

## Domain model

Recommended public routing:

- `invite.garhy.ai/<event-slug>` — public or generic event experience
- `invite.garhy.ai/i/<opaque-token>` — personalized guest invitation
- `garhy.ai/work/mostafa-amira-2026` — GARHY TECH portfolio case study after the redesigned version is approved

Do not move the current production alias until the product branch passes mobile, accessibility, RSVP, share, media and performance QA.

## Security requirements

- Never place service-role Supabase keys in client assets.
- Guest tokens must be opaque and revocable.
- RSVP writes require database policy enforcement and input validation.
- QR/pass verification must be server-authoritative.
- Public analytics must not expose guest names or RSVP message contents.
- Personalized guest data should be minimized and retained according to event-owner policy.

## Current implementation on `feat/garhy-invite-platform-v1`

The existing static app has received a compatibility-safe productization layer that adds:

- reusable event metadata object
- lifecycle resolver
- post-event RSVP closure behavior
- personalized welcome context
- local guest-pass primitive
- adaptive mobile quick-actions dock
- share handling
- map/navigation analytics hooks
- lightweight `dataLayer` + `CustomEvent` telemetry contract
- public `window.GARHY_INVITE` integration surface

This is the bridge from the single wedding site to the multi-event product. It is intentionally not the final server-backed guest identity or QR verification system.
