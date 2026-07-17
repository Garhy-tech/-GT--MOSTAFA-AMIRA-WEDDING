# PROJECT_STATE.md

## Official Handoff Document — Mostafa & Amira Wedding Invitation

> **Generated:** 2026-07-17  
> **Commit basis:** `chore(infra): configure static server workflow + hide loader pre-JS`  
> **Purpose:** Authoritative state snapshot for future development sessions.

---

## 1. Completed Phases

| #   | Phase                      | Commit                                                                | Status  |
| --- | -------------------------- | --------------------------------------------------------------------- | ------- |
| 1   | Audit                      | _(no commit — analysis only)_                                         | ✅ Done |
| 2   | Project Structure Sync     | `chore(project): synchronize project structure`                       | ✅ Done |
| 3   | Design Foundation          | `chore(styles): initialize design foundation`                         | ✅ Done |
| 4   | Global Layout System       | `chore(layout): initialize global layout system`                      | ✅ Done |
| 5a  | Reusable Component Library | `feat(ui): implement reusable component library`                      | ✅ Done |
| 5b  | Page Composition Framework | `feat(layout): assemble page composition`                             | ✅ Done |
| 6   | Visual Implementation      | `feat(ui): implement complete visual design`                          | ✅ Done |
| —   | Infra / Workflow           | `chore(infra): configure static server workflow + hide loader pre-JS` | ✅ Done |

**Phase 7 (JavaScript interactivity) has NOT been started.**

---

## 2. Current Architecture

```
Type:       Zero-dependency static site
Languages:  HTML5 · CSS3 · Vanilla JS (stub only)
Rendering:  Client-side, single HTML file
Server:     Node.js inline HTTP server (workflow)
Fonts:      Google Fonts CDN (Cinzel, Cairo, Great Vibes, Playfair Display)
```

No build tool, no framework, no package.json, no node_modules. The site is a single `index.html` consuming two CSS files and one (currently empty) JS file.

---

## 3. Folder Structure

```
/
├── index.html                   ← 1 937-line master file (all content + page CSS)
├── assets/
│   ├── css/
│   │   ├── style.css            ← Design tokens + layout system (do not modify)
│   │   └── components.css       ← 20 reusable UI components (modify only if essential)
│   ├── js/
│   │   └── app.js               ← EMPTY — Phase 7 target
│   └── audio/
│       └── music.mp3            ← MISSING — client must supply
├── design-system/               ← READ-ONLY reference images + markdown docs
│   ├── 01-09 reference PNGs
│   └── *.md design docs
├── docs/                        ← Empty placeholder
├── .ai/                         ← Empty placeholder
├── PROJECT_STATE.md             ← This file
├── PROJECT_CONTEXT.md           ← Original brief (do not modify)
├── README.md                    ← Project readme (do not modify)
└── replit.md                    ← Replit config + user preferences
```

---

## 4. Existing CSS Systems

### 4a. `assets/css/style.css` — 1 503 lines · **LOCKED**

Do not modify this file. It contains every token and layout primitive the entire site depends on.

**Custom Properties (80+ tokens):**

| Group           | Examples                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| Colors          | `--color-blush-100…500`, `--color-emerald-100…600`, `--color-rose-gold-100…500`, `--color-white`, `--color-black`   |
| Semantic colors | `--color-bg-primary`, `--color-text-primary`, `--color-accent-primary`, `--color-accent-secondary`                  |
| Typography      | `--font-heading` (Cinzel), `--font-body` (Cairo), `--font-script` (Great Vibes), `--font-accent` (Playfair Display) |
| Type scale      | `--text-xs` … `--text-display-xl` (fluid clamp values)                                                              |
| Spacing         | `--space-1` (4 px) … `--space-24` (96 px), 4 pt grid                                                                |
| Radius          | `--radius-sm` … `--radius-full`                                                                                     |
| Shadow          | `--shadow-sm` … `--shadow-dramatic`, `--shadow-glow-*`                                                              |
| Glass           | `--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-blur-heavy`                                                |
| Motion          | `--duration-fast` … `--duration-cinematic`, `--ease-smooth`, `--ease-spring`, `--ease-dramatic`                     |
| Z-index         | `--z-base` … `--z-overlay`                                                                                          |

**Animation Keyframes (13):**
`fadeIn`, `fadeInUp`, `fadeInDown`, `slideInLeft`, `slideInRight`, `float`, `floatSlow`, `shimmer`, `shimmerGold`, `crystalRotate`, `pulseGlow`, `particleFade`, `loaderSpin`

**Utility Classes:**

- Typography: `.font-heading`, `.font-body`, `.font-script`, `.font-accent`, `.text-xs` … `.text-display-xl`, `.text-center`, `.text-left`, `.text-right`
- Color: `.text-blush`, `.text-emerald`, `.text-rose-gold`, `.text-white`, `.bg-blush`, `.bg-emerald`, `.bg-white`
- Spacing: `.mt-{1-24}`, `.mb-{1-24}`, `.pt-{1-24}`, `.pb-{1-24}`, `.px-{1-24}`, `.py-{1-24}`
- Glass: `.glass`, `.glass--heavy`, `.glass--crystal`
- Layout: `.flex`, `.flex-col`, `.items-center`, `.justify-center`, `.justify-between`, `.gap-{1-12}`, `.w-full`, `.max-w-{sm,md,lg,xl,2xl,full}`, `.mx-auto`
- Responsive prefixes: `md:`, `lg:`, `xl:` (640 px / 1024 px / 1280 px)

**Layout System (appended to style.css):**

- Skip-link, loader shell (`#loader`), `#app`, landmark shells
- `.section` base + 5 variants: `.section--hero`, `.section--dark`, `.section--glass`, `.section--crystal`, `.section--editorial`
- `.section__inner` width modifiers: `--narrow`, `--wide`, `--full`
- 6 named grid patterns: `grid-auto`, `grid-info-cards`, `grid-gallery`, `grid-editorial`, `grid-countdown`, `grid-map-rsvp`
- 5 named flex patterns

### 4b. `assets/css/components.css` — 1 923 lines

**20 reusable components (modify only if essential):**

| Component          | Class                                                                          | Notes                            |
| ------------------ | ------------------------------------------------------------------------------ | -------------------------------- |
| Buttons            | `.btn` + `--primary`, `--secondary`, `--ghost`, `--icon`                       | Emerald primary, blush secondary |
| Glass card         | `.card-glass`                                                                  | Backdrop-filter blur             |
| Crystal card       | `.card-crystal`                                                                | Frosted glassmorphism            |
| Section title      | `.section-title` + `__eyebrow`, `__heading`, `__subheading`, `__script`        | With decorative flanking lines   |
| Decorative divider | `.decor-divider`                                                               | Rose-gold ornamental separator   |
| Badge              | `.badge`                                                                       | Pill-shaped label                |
| Countdown unit     | `.countdown-unit` + `__number`, `__label`, `__sep`                             | Single digit block               |
| Info card          | `.info-card` + `__icon`, `__label`, `__value`, `__sub`                         | Event details card               |
| Timeline           | `.timeline` + `.timeline-item` + `__dot`, `__date`, `__title`, `__body`        | Horizontal story timeline        |
| Quote block        | `.quote-block` + `__text`, `__author`                                          | Styled love quote                |
| Gallery item       | `.gallery-item` + `__media`, `__img`, `__overlay`, `__caption`                 | Hover-reveal caption             |
| RSVP option        | `.rsvp-option` + `__input`, `__label`                                          | Accept / Decline radio           |
| Social icon        | `.social-icon`                                                                 | Share link button                |
| Scroll indicator   | `.scroll-indicator`                                                            | Animated bounce arrow            |
| Music button       | `.btn-music` + `__icon`, `__ring`                                              | Floating circular toggle         |
| Modal              | `.modal` + `__backdrop`, `__panel`, `__header`, `__title`, `__close`, `__body` | Dialog overlay                   |
| Toast              | `.toast` + `--success`, `--error`, `--info`                                    | Notification strip               |
| Toast region       | `.toast-region`                                                                | ARIA live container              |

### 4c. Page-level `<style>` block inside `index.html`

Visual overrides and page-specific rules that could not be expressed purely with the component library. These are intentional additions (not duplications). Includes:

- Site header glass effect + scrolled state shell
- Hero gradient background + crystal arch (`.hero__arch`) CSS frame
- M&A monogram styling: bow tie (🎀 emoji + CSS on M) + crown (♛ emoji on A), rose-gold Cinzel letterforms
- Countdown flex-layout override for diamond separators between units
- Story / Gallery / Couple / Location / RSVP section visual refinements
- RSVP form field styles (`.rsvp__input`, `.rsvp__label`, `.rsvp__field`, `.rsvp__field-row`, `.rsvp__privacy`)
- Transport cards (`.transport-card`)
- Location map placeholder (`.location__map`)
- Footer monogram + copyright
- Loader override: `opacity: 0; visibility: hidden; pointer-events: none` — **CSS hides loader until JS Phase implements it properly**
- Mobile responsive overrides

---

## 5. Existing UI Components

All 20 component classes from `components.css` are instantiated in `index.html`. Summary of live usage:

| Section    | Components used                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| Header     | Glass header, nav links, `.btn--primary` (RSVP CTA)                                                               |
| Hero       | `.section--hero`, `.hero__arch` (crystal frame), `.section-title`, monogram, `.scroll-indicator`, `.btn--primary` |
| Countdown  | `.section--dark`, `.section-title`, `.countdown-unit` ×4, diamond separators                                      |
| Our Story  | `.section--crystal`, `.section-title`, `.timeline` with 4 `.timeline-item` nodes, `.quote-block`                  |
| The Event  | `.section`, `.section-title`, `.info-card` ×4 (date, time, venue, dress code), `.transport-card` ×3               |
| The Couple | `.section--glass`, `.section-title`, couple portrait placeholders, `.badge` tags                                  |
| Gallery    | `.section`, `.section-title`, `.gallery-item` ×6 (gradient placeholders), `.btn--ghost` (View All)                |
| Location   | `.section--crystal`, `.section-title`, `.location__map` iframe placeholder, `.btn--secondary` (Directions)        |
| RSVP       | `.section--dark`, `.section-title`, `.rsvp-option` ×2, form fields, `.btn--primary` submit                        |
| Footer     | Monogram, copyright, `.social-icon` ×5                                                                            |
| Overlays   | `#global-modal` (share sheet), `#toast-region`, `#music-player`                                                   |

---

## 6. Existing HTML Structure

`index.html` — 1 937 lines. Full semantic skeleton with all 8 sections.

```
<html lang="ar-EG" dir="rtl">
  <head>
    Google Fonts · style.css · components.css · app.js · SEO meta · OG tags · theme-color
    <style> ← page-level visual overrides </style>
  </head>
  <body>
    <a class="skip-link" href="#main-content">…</a>
    <div id="loader" role="status">…</div>
    <div id="app">
      <div id="canvas-particles" aria-hidden="true"></div>
      <header id="site-header" role="banner">
        ← M&A wordmark + <nav id="site-nav"> with 7 nav links + mobile toggle
      </header>
      <main id="main-content" role="main">
        <section id="hero" aria-labelledby="hero-heading">
          ← Crystal arch, M&A monogram, couple names h1, date line, CTA buttons, scroll indicator
        </section>
        <section id="countdown" aria-labelledby="countdown-heading" data-countdown>
          ← 4× .countdown-unit [data-countdown="days|hours|minutes|seconds"], diamond seps
        </section>
        <section id="our-story" aria-labelledby="our-story-heading">
          ← .quote-block, .timeline with 4 chapters (2020·2021·2025·31 July 2026)
        </section>
        <section id="the-event" aria-labelledby="the-event-heading">
          ← 4× .info-card, 3× .transport-card
        </section>
        <section id="the-couple" aria-labelledby="the-couple-heading">
          ← Couple portraits (gradient placeholders), .badge tags, bio text
        </section>
        <section id="gallery" aria-labelledby="gallery-heading">
          ← 6× .gallery-item (gradient placeholders + figcaptions), View All btn
        </section>
        <section id="location" aria-labelledby="location-heading">
          ← .location__map (Google Maps iframe placeholder), address, directions btn
        </section>
        <section id="rsvp" aria-labelledby="rsvp-heading">
          ← #rsvp-form: .rsvp-option ×2, name/guests/phone/dietary/message fields, submit
          ← #rsvp-success: hidden success state (aria-hidden="true")
        </section>
      </main>
      <footer id="site-footer" role="contentinfo">
        ← Monogram, nav links, social icons, copyright
      </footer>
    </div><!-- /#app -->

    <!-- Overlays -->
    <div id="global-modal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="modal-title">
      ← Share sheet: WhatsApp · Facebook · Instagram · X · Messenger · Copy link
    </div>
    <div id="toast-region" role="log" aria-live="polite"></div>

    <!-- Music player -->
    <div id="music-player" role="complementary">
      <audio id="music-audio" loop preload="none">
        <source src="assets/audio/music.mp3" type="audio/mpeg">
      </audio>
      <button class="btn-music" id="music-toggle" aria-pressed="false" aria-label="Play background music">
        ← Musical note SVG icon + .btn-music__ring
      </button>
    </div>
  </body>
</html>
```

**Heading hierarchy:** Single `<h1>` in `#hero` → `<h2>` per section → `<h3>` inside sections. All 8 `aria-labelledby` IDs verified.

**Inline SVG icons present throughout:** calendar, clock, location pin, star, home, car, plane, parking, heart (accept), × (decline), send arrow, lock, map-pin, WhatsApp, Facebook, Instagram, X, Messenger, copy-link, music note, close ×.

**JS hooks wired (awaiting Phase 7):**

- `data-countdown="days|hours|minutes|seconds"` — countdown number targets
- `data-modal-close` — modal close triggers (button + backdrop)
- `data-copy-link` — clipboard copy button
- `#music-toggle` with `aria-pressed` — music player toggle
- `#rsvp-form` / `#rsvp-success` — form submission flow
- `#global-modal` with `aria-hidden` — share modal
- `#loader` — loader dismiss

---

## 7. JavaScript Status

**`assets/js/app.js` — 0 bytes. Completely empty.**

The file is linked in `<head>` via `<script src="assets/js/app.js" defer></script>`. No JavaScript has been written.

**All functionality that requires JS is currently non-functional:**

| Feature                         | Status                                      |
| ------------------------------- | ------------------------------------------- |
| Page loader dismiss             | ❌ Loader hidden via CSS override (see §4c) |
| Header `.is-scrolled` on scroll | ❌                                          |
| Mobile nav toggle               | ❌                                          |
| Countdown timer                 | ❌ Displays `--` placeholder                |
| Scroll-reveal animations        | ❌                                          |
| Music player play/pause         | ❌                                          |
| Share modal open/close          | ❌                                          |
| Toast notifications             | ❌                                          |
| Clipboard copy                  | ❌                                          |
| Gallery lightbox                | ❌                                          |
| RSVP form submission            | ❌                                          |
| Smooth scroll (nav links)       | ❌                                          |
| Canvas particle effect          | ❌                                          |

**Phase 7 must implement all of the above in `assets/js/app.js` only.**

---

## 8. Remaining Tasks

### Phase 7 — JavaScript (Priority: HIGH)

Write `assets/js/app.js` implementing:

1. **Loader** — on `window.load`, fade out `#loader` and remove from DOM. JS must first restore `opacity/visibility` (overriding the CSS-only hide), then transition out.
2. **Header scroll** — add `.is-scrolled` to `#site-header` when `window.scrollY > 60`.
3. **Mobile nav** — toggle `#nav-menu` open/close via `#nav-toggle`; close on link click; close on outside click.
4. **Countdown** — target `2026-07-31T17:00:00Z` (= 19:00 Cairo UTC+2). Write `pad(n)` values into `[data-countdown="days|hours|minutes|seconds"]` spans every second.
5. **Scroll-reveal** — `IntersectionObserver` on `[data-reveal]` elements; add `.is-revealed` on entry. Graceful fallback for old browsers.
6. **Music player** — `#music-toggle` play/pause `#music-audio`; toggle `aria-pressed`, `aria-label`, `.is-playing`; attempt autoplay on first user interaction at `volume 0.4`.
7. **Modal** — `[data-modal-open]` opens `#global-modal`; `[data-modal-close]` and backdrop click and `Escape` close it; manage `aria-hidden`.
8. **Toast** — `showToast(message, type, duration)` function; dynamically creates `.toast` inside `#toast-region`.
9. **Clipboard** — `[data-copy-link]` writes `window.location.href` to clipboard; shows toast on success.
10. **Gallery lightbox** — click `.gallery-item` to open overlay; prev/next navigation; `Escape` to close; keyboard accessible.
11. **RSVP** — intercept `#rsvp-form` submit; `fetch` to `form.action` (Formspree/EmailJS endpoint TBD); on success show `#rsvp-success`, hide form; on error show toast.
12. **Smooth scroll** — `a[href^="#"]` scrolls smoothly to target section.

### Phase 8 — Client-supplied Assets (Blocked on Client)

- `assets/audio/music.mp3` — wedding background music
- Real couple photos (6 gallery images + 2 portrait images for The Couple section)
- Google Maps embed URL + API key (for `#location` iframe)
- RSVP form endpoint URL (Formspree, EmailJS, or Google Sheets)

### Phase 9 — RSVP Backend (Blocked on Phase 8 decisions)

Connect RSVP form to a real submission endpoint. Recommended: Formspree (no server needed) or EmailJS.

### Phase 10 — Monogram SVG Upgrade (Optional / Design Polish)

The M (bow tie) + A (crown) monogram currently uses emoji characters (🎀 ♛) + CSS on Cinzel letterforms. The design system specifies a proper illustrated SVG mark. This should be upgraded to a custom SVG when a designer produces the asset.

### Phase 11 — Deployment (Final)

Configure Replit deployment or export static files to a CDN/hosting provider.

---

## 9. Known Limitations

| #   | Issue                                     | Severity      | Notes                                                                                         |
| --- | ----------------------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| 1   | `assets/js/app.js` is empty               | 🔴 Critical   | All interactivity broken                                                                      |
| 2   | `assets/audio/music.mp3` missing          | 🟡 Medium     | `<audio>` element present, src 404                                                            |
| 3   | Google Maps iframe commented out          | 🟡 Medium     | Needs embed URL from client                                                                   |
| 4   | RSVP form `action=""` is empty            | 🟡 Medium     | Form submits to itself; needs endpoint                                                        |
| 5   | Gallery uses gradient placeholders        | 🟡 Medium     | No real photos yet                                                                            |
| 6   | Couple section uses gradient placeholders | 🟡 Medium     | No real photos yet                                                                            |
| 7   | Loader hidden via CSS, not JS             | 🟠 Low        | CSS override in page `<style>` block; must be corrected in Phase 7                            |
| 8   | One inline `style` attribute              | 🟢 Negligible | Inside `#rsvp-success > p`; minor cleanup                                                     |
| 9   | Monogram uses emoji + Cinzel              | 🟢 Negligible | Functional but not the ideal SVG mark                                                         |
| 10  | Canvas particles (`#canvas-particles`)    | 🟢 Negligible | Placeholder div; needs JS particle engine                                                     |
| 11  | `lang="ar-EG" dir="rtl"`                  | 🟠 Low        | Content is Arabic-named but text is mixed Arabic/English; verify RTL layout with real content |

---

## 10. Recommended Next Development Order

```
Phase 7   →  Write assets/js/app.js (all interactivity)
Phase 8   →  Receive client assets (audio, photos, maps key, RSVP endpoint)
Phase 8b  →  Replace gradient placeholders with real images
Phase 9   →  Wire RSVP endpoint; test submission flow
Phase 10  →  (Optional) Upgrade emoji monogram to illustrated SVG
Phase 11  →  Final cross-browser / mobile QA pass
Phase 12  →  Deploy to production
```

**Do not skip Phase 7 to proceed to Phase 8** — the JS layer must exist before real content can be meaningfully verified.

---

## 11. Last Git Commits

```
* chore(infra): configure static server workflow + hide loader pre-JS
* feat(ui): implement complete visual design
* feat(layout): assemble page composition
* feat(ui): implement reusable component library
* chore(layout): initialize global layout system
* chore(styles): initialize design foundation
* chore(project): synchronize project structure
```

All commits are on `main`. No branches. No tags.

---

## 12. Important Implementation Notes

### Design System Rules (Non-negotiable)

- **Allowed colors:** Blush Pink `#FAD6E3`, Emerald Green `#0D6857`, Rose Gold `#E7B7A1`, Crystal White `#FFFFFF` — always via CSS variables, never hardcoded hex.
- **Forbidden colors:** Beige, brown, dark yellow, dirty gold, any color not in the palette.
- **M always has a luxury bow tie. A always has an elegant feminine crown.** (Currently: emoji implementation; future: SVG.)
- **Fonts strictly:** Cinzel (headings), Cairo (body), Great Vibes (script accents), Playfair Display (accent). No other fonts.
- **Wedding date:** 31 · 07 · 2026 · 07:00 PM · Royal Garden Palace · 5th Settlement · Cairo, Egypt.
- **Countdown target:** `2026-07-31T17:00:00Z` (Cairo UTC+2 = 19:00 local).

### CSS Architecture Rules

- `style.css` is immutable — no modifications.
- `components.css` is near-immutable — only change if a bug exists in a component definition itself.
- New visual rules go in the page-level `<style>` block in `index.html`.
- Never add a new `.css` file.
- Never hardcode a color value anywhere in `index.html`; always use `var(--color-*)`.

### JS Architecture Rules

- All JavaScript goes in `assets/js/app.js` only.
- No external JS libraries.
- No new `.js` files.
- The file is loaded with `defer` — DOM is ready when it executes.
- Phase 7 JS must remove the CSS loader override (the `opacity: 0` block in the page `<style>`) and replace it with proper JS-driven loader dismissal.

### Loader Correction Required in Phase 7

The page `<style>` block currently contains:

```css
#loader {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
```

This is a temporary CSS-only fix so the page renders visibly without JS. **Phase 7 must:**

1. Remove this CSS block from `index.html`.
2. In `app.js`, listen for `window.load`, then add `.loader--hidden` to `#loader`.
3. `style.css` already defines the transition for `.loader--hidden`.

### Accessibility Baselines Already Implemented

- Skip-link to `#main-content`
- All 8 sections have `aria-labelledby` wired to their `<h2>` IDs
- Single `<h1>` in hero; consistent heading hierarchy throughout
- All decorative elements have `aria-hidden="true"`
- All interactive elements have `aria-label` attributes
- `#rsvp-form` has `aria-describedby` pointing to `#rsvp-validation-summary`
- `#toast-region` is `role="log" aria-live="polite"`
- `#global-modal` is `role="dialog" aria-modal="true" aria-hidden="true"`
- `.gallery-item` items have `tabindex="0"` for keyboard access

### Server / Workflow

- Workflow: **"Start application"** — inline Node.js HTTP server on port 5000
- Command: `node -e "const http=require('http')…"` (see `.replit` workflow config)
- No `package.json`, no `node_modules`, no npm scripts
- To restart: use WorkflowsRestart tool or Replit workflow panel

### Files That Must Never Be Modified

- `design-system/` — all files (reference only)
- `assets/css/style.css` — locked design foundation
- `README.md` — project readme
- `PROJECT_CONTEXT.md` — original brief
- `PROJECT_STATE.md` — this file (replace with updated version at next handoff only)
