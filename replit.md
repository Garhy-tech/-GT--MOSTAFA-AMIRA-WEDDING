# GT-MOSTAFA-AMIRA-WEDDING

## Project Overview

Luxury Digital Wedding Invitation for Mostafa & Amira.

A zero-dependency static website (HTML, CSS, JavaScript) with no build step or framework.

### Stack

- HTML5 (single-page, `index.html`)
- CSS3 (`assets/css/style.css`)
- Vanilla JS (`assets/js/app.js`)
- Google Fonts CDN: Cinzel, Cairo, Great Vibes, Playfair Display

### Folder Structure

```
/
├── index.html
├── assets/
│   ├── css/style.css
│   ├── js/app.js
│   └── audio/music.mp3      ← to be supplied by client
├── design-system/            ← single source of truth (do not modify)
├── .ai/                      ← AI context files
├── docs/                     ← project documentation
└── PROJECT_CONTEXT.md
```

### Design System

The `design-system/` folder is the **single source of truth**.
Read every image and markdown file before writing any code.
Reading order: `00_PROJECT_RULES.md` → images 01–09 → colors → typography → components → animations → specifications → rules → prompts.

### Key Brand Rules

- **M** always renders with a luxury bow tie.
- **A** always renders with an elegant feminine crown.
- Color palette: Blush Pink `#FAD6E3`, Emerald Green `#0D6857`, Rose Gold `#E7B7A1`, Crystal White `#FFFFFF`.
- Forbidden colors: Beige, Brown, Dark Yellow, Dirty Gold.
- Heading font: Cinzel. Body font: Cairo. Script accent: Great Vibes.
- Style: Luxury · Crystal · Glassmorphism · Editorial.

### Wedding Details

- Date: 31 · 07 · 2026 (Friday) — confirm with client before coding
- Time: 07:00 PM
- Venue: Royal Garden Palace, 5th Settlement, Cairo, Egypt

## User Preferences

- Do not redesign, reinterpret, or invent colors outside the design system.
- Do not modify anything inside `design-system/`.
- Always fix file paths before any other change.
- Phase work: Foundation → Visual Identity → Sections → Animation → Polish.
