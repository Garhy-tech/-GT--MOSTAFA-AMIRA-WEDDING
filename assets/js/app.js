/*!
 * Mostafa & Amira Wedding — app.js
 * Phase 7: Complete Interaction Layer
 *
 * Modules (in boot order):
 *  1.  Loader
 *  2.  Sticky Header
 *  3.  Mobile Navigation
 *  4.  Smooth Scroll + Active Nav Highlight
 *  5.  Scroll Indicator
 *  6.  Scroll Reveal
 *  7.  Countdown Timer
 *  8.  Music Player
 *  9.  Toast Notifications
 * 10.  Modal (share sheet)
 * 11.  Clipboard Copy
 * 12.  Gallery Lightbox
 * 13.  RSVP Validation + Submission
 */

"use strict";

/* ═══════════════════════════════════════════════════════════
   UTILITIES
   Cached at module scope so every function shares the same
   references without redundant querySelector calls.
════════════════════════════════════════════════════════════ */

/** @type {(sel: string, ctx?: ParentNode) => Element | null} */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/** @type {(sel: string, ctx?: ParentNode) => Element[]} */
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** True when the OS/browser reduces motion */
const REDUCED_MOTION = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/** Clamp a number between min and max */
const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

/* ═══════════════════════════════════════════════════════════
   1. PAGE LOADER
   style.css defines #loader with opacity:1 by default and
   a transition on #loader.loader--hidden → opacity:0.
   JS adds the class on window.load so the page is fully
   painted before the loader fades out.
════════════════════════════════════════════════════════════ */

function initLoader() {
  const loader = $("#loader");
  if (!loader) {
    // No loader element — mark page as loaded so hero entrance animations fire
    document.body.classList.add("is-loaded");
    return;
  }

  const dismiss = () => {
    loader.classList.add("loader--hidden");
    // Remove from DOM after transition, then signal ready for hero entrance
    const cleanup = () => {
      if (loader.isConnected) loader.remove();
      document.body.classList.add("is-loaded");
    };
    loader.addEventListener("transitionend", cleanup, { once: true });
    setTimeout(cleanup, 800); // failsafe if transitionend never fires
  };

  if (document.readyState === "complete") {
    // Fonts / images already loaded (e.g. hard refresh with cache)
    dismiss();
  } else {
    window.addEventListener("load", dismiss, { once: true });
    // Hard failsafe: never block the page for more than 6 seconds
    setTimeout(dismiss, 6000);
  }
}

/* ═══════════════════════════════════════════════════════════
   2. STICKY HEADER
   Adds .is-scrolled to #site-header once the user scrolls
   past 60 px. style.css handles the visual transition.
════════════════════════════════════════════════════════════ */

function initHeader() {
  const header = $("#site-header");
  if (!header) return;

  const update = () =>
    header.classList.toggle("is-scrolled", window.scrollY > 60);

  window.addEventListener("scroll", update, { passive: true });
  update(); // set correct state on first paint
}

/* ═══════════════════════════════════════════════════════════
   3. MOBILE NAVIGATION
   Toggle .is-open on #site-nav ul via .site-header__menu-toggle.
   Close on: link click, outside click, Escape key.
════════════════════════════════════════════════════════════ */

function initMobileNav() {
  const toggle = $(".site-header__menu-toggle");
  const navList = $("#site-nav ul");
  const header = $("#site-header");
  if (!toggle || !navList) return;

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  const open = () => {
    toggle.setAttribute("aria-expanded", "true");
    navList.classList.add("is-open");
  };

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    navList.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => (isOpen() ? close() : open()));

  // Close when a nav link is tapped (smooth scroll takes over)
  $$("a", navList).forEach((a) => a.addEventListener("click", close));

  // Close on outside click
  document.addEventListener(
    "click",
    (e) => {
      if (isOpen() && header && !header.contains(e.target)) close();
    },
    { passive: true },
  );

  // Close on Escape and return focus to toggle
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      close();
      toggle.focus();
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   4. SMOOTH SCROLL + ACTIVE NAV HIGHLIGHT
   Smooth-scrolls all anchor links accounting for header height.
   Uses IntersectionObserver to highlight the current section
   in the navigation as the user scrolls.
════════════════════════════════════════════════════════════ */

function initNavigation() {
  const header = $("#site-header");
  const navLinks = $$('#site-nav a[href^="#"]');

  /* ── Smooth scroll ─────────────────────────── */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href").slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();

      const headerH = header ? header.offsetHeight : 0;
      const top =
        target.getBoundingClientRect().top + window.scrollY - headerH - 8;

      window.scrollTo({ top, behavior: REDUCED_MOTION ? "auto" : "smooth" });
    });
  });

  /* ── Active nav highlight ──────────────────── */
  if (!navLinks.length) return;

  const sections = $$("main section[id]");
  if (!sections.length) return;

  const setActive = (id) => {
    navLinks.forEach((a) => {
      const active = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("is-active", active);
      // aria-current="page" is semantically incorrect here (not a page);
      // aria-current="true" signals "current item" in a set.
      if (active) {
        a.setAttribute("aria-current", "true");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  };

  // Root margin: slightly above the midpoint so the active state changes
  // just as the section reaches the upper third of the viewport.
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-30% 0px -65% 0px", threshold: 0 },
  );

  sections.forEach((s) => obs.observe(s));
}

/* ═══════════════════════════════════════════════════════════
   5. SCROLL INDICATOR
   The hero scroll indicator (.scroll-indicator) fades out once
   the user has scrolled more than 80 px. CSS owns the animation;
   JS only adds the class.
════════════════════════════════════════════════════════════ */

function initScrollIndicator() {
  const indicator = $(".scroll-indicator");
  if (!indicator) return;

  const hide = () => {
    if (window.scrollY > 80) {
      indicator.classList.add("is-hidden");
      window.removeEventListener("scroll", hide);
    }
  };

  window.addEventListener("scroll", hide, { passive: true });
}

/* ═══════════════════════════════════════════════════════════
   6. SCROLL REVEAL
   Observes [data-reveal] elements and adds .is-revealed when
   they enter the viewport. CSS owns the transition/animation.
   Respects prefers-reduced-motion.
════════════════════════════════════════════════════════════ */

function initScrollReveal() {
  const targets = $$("[data-reveal]");
  if (!targets.length) return;

  // Reduced motion or no observer support: reveal immediately
  if (REDUCED_MOTION || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = Number(el.dataset.revealDelay ?? 0);
        setTimeout(() => el.classList.add("is-revealed"), delay);
        obs.unobserve(el);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -48px 0px" },
  );

  targets.forEach((el) => obs.observe(el));
}

/* ═══════════════════════════════════════════════════════════
   7. COUNTDOWN TIMER
   Target: 31 July 2026, 19:00 Cairo (UTC+2) = 17:00 UTC.
   Writes padded values into [data-countdown="…"] spans
   every second. Shows "00" on all units when the date passes.
════════════════════════════════════════════════════════════ */

function initCountdown() {
  const container = $("#countdown-timer");
  if (!container) return;

  // 31 July 2026 at 17:00 UTC = 19:00 Cairo (UTC+2)
  const TARGET_MS = new Date("2026-07-31T17:00:00Z").getTime();

  const pad = (n) => String(n).padStart(2, "0");

  // Cache element references — never query inside the interval
  const units = {
    days: $('[data-countdown="days"]', container),
    hours: $('[data-countdown="hours"]', container),
    minutes: $('[data-countdown="minutes"]', container),
    seconds: $('[data-countdown="seconds"]', container),
  };

  // Trigger .countdown-unit--flip on the parent card when a digit changes.
  // components.css already defines: .countdown-unit--flip .countdown-unit__number
  // { animation: countFlip var(--duration-fast) … }
  const flip = (el) => {
    if (REDUCED_MOTION || !el) return;
    const unit = el.closest(".countdown-unit");
    if (!unit) return;
    unit.classList.remove("countdown-unit--flip");
    void unit.offsetWidth; // force reflow so animation restarts each tick
    unit.classList.add("countdown-unit--flip");
  };

  // Update text content and flip only when the displayed value actually changes
  const updateUnit = (el, text) => {
    if (!el || el.textContent === text) return;
    el.textContent = text;
    flip(el);
  };

  const tick = () => {
    const diff = TARGET_MS - Date.now();
    const totalSec = Math.max(0, Math.floor(diff / 1000));
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    updateUnit(units.days, pad(d));
    updateUnit(units.hours, pad(h));
    updateUnit(units.minutes, pad(m));
    updateUnit(units.seconds, pad(s));
  };

  tick(); // paint immediately on load
  setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════════════════════
   8. MUSIC PLAYER
   Toggles the <audio> element via .btn-music.
   Applies .is-playing and manages aria-pressed + aria-label.
   Attempts polite autoplay on the first user gesture.
════════════════════════════════════════════════════════════ */

function initMusicPlayer() {
  const btn = $(".btn-music");
  const audio = $("#music-audio");
  if (!btn || !audio) return;

  audio.volume = 0.4;

  const setPlaying = (playing) => {
    btn.setAttribute("aria-pressed", String(playing));
    btn.setAttribute(
      "aria-label",
      playing ? "Pause background music" : "Play background music",
    );
    btn.classList.toggle("is-playing", playing);
  };

  // Sync state from audio events (handles browser-level pause, etc.)
  audio.addEventListener("play", () => setPlaying(true));
  audio.addEventListener("pause", () => setPlaying(false));
  audio.addEventListener("ended", () => setPlaying(false));

  // Manual toggle
  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => {
        // Autoplay policy blocked — silently ignore
      });
    } else {
      audio.pause();
    }
  });

  // Polite autoplay on first page interaction (not the music button itself)
  let autoplayAttempted = false;
  const tryAutoplay = (e) => {
    if (autoplayAttempted || e.target === btn || btn.contains(e.target)) return;
    autoplayAttempted = true;
    audio.play().catch(() => {});
    document.removeEventListener("click", tryAutoplay);
    document.removeEventListener("touchstart", tryAutoplay);
    document.removeEventListener("keydown", tryAutoplay);
  };
  document.addEventListener("click", tryAutoplay, { passive: true });
  document.addEventListener("touchstart", tryAutoplay, { passive: true });
  document.addEventListener("keydown", tryAutoplay, { passive: true });
}

/* ═══════════════════════════════════════════════════════════
   9. TOAST NOTIFICATIONS
   components.css defines .toast with a toastIn CSS animation
   (plays automatically on append) and .toast--exit triggers
   the toastOut animation before removal.
   Call showToast() from anywhere in this file.
════════════════════════════════════════════════════════════ */

/**
 * Display a toast notification.
 * @param {string} message   - Text to display.
 * @param {'success'|'error'|'info'} [type='success']
 * @param {number} [duration=3500]  - Milliseconds before auto-dismiss.
 */
function showToast(message, type = "success", duration = 3500) {
  const region = $("#toast-region");
  if (!region) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  toast.setAttribute("role", "status");

  region.appendChild(toast);

  // Dismiss: add exit class → CSS plays toastOut → remove from DOM
  const dismiss = () => {
    toast.classList.add("toast--exit");
    const cleanup = () => toast.isConnected && toast.remove();
    toast.addEventListener("animationend", cleanup, { once: true });
    setTimeout(cleanup, 500); // failsafe
  };

  setTimeout(dismiss, duration);
}

/* ═══════════════════════════════════════════════════════════
   10. MODAL  (Share sheet — #global-modal)
   components.css shows the modal when .is-open is present or
   aria-hidden is "false". Focus is trapped inside while open
   and restored to the trigger element on close.
════════════════════════════════════════════════════════════ */

(function initModals() {
  const modal = $("#global-modal");
  if (!modal) return;

  let prevFocus = null;

  /* ── Focus trap ─────────────────────────── */
  const FOCUSABLE =
    'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

  const trapFocus = (e) => {
    if (e.key !== "Tab") return;
    const focusable = $$(":is(" + FOCUSABLE + ")", modal).filter(
      (el) => !el.hidden && el.offsetParent !== null,
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  /* ── Open ───────────────────────────────── */
  const openModal = () => {
    prevFocus = document.activeElement;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
    modal.addEventListener("keydown", trapFocus);

    // Focus the close button
    const closeBtn = $("[data-modal-close]", modal);
    if (closeBtn) requestAnimationFrame(() => closeBtn.focus());
  };

  /* ── Close ──────────────────────────────── */
  const closeModal = () => {
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    modal.removeEventListener("keydown", trapFocus);

    if (prevFocus && typeof prevFocus.focus === "function") {
      prevFocus.focus();
      prevFocus = null;
    }
  };

  // Open triggers (data-modal-open attribute)
  $$("[data-modal-open]").forEach((btn) =>
    btn.addEventListener("click", openModal),
  );

  // Close triggers: × button and backdrop both carry data-modal-close
  $$("[data-modal-close]", modal).forEach((el) =>
    el.addEventListener("click", closeModal),
  );

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
})();

/* ═══════════════════════════════════════════════════════════
   11. CLIPBOARD COPY
   Writes window.location.href to the clipboard when a
   [data-copy-link] button is clicked. Falls back to
   document.execCommand for older browsers.
════════════════════════════════════════════════════════════ */

function initClipboard() {
  $$("[data-copy-link]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const url = window.location.href;

      try {
        await navigator.clipboard.writeText(url);
        showToast("Invitation link copied! ✨");
      } catch {
        // Fallback for browsers without clipboard API
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.cssText =
          "position:fixed;inset:0 0 auto auto;opacity:0;pointer-events:none;";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
          document.execCommand("copy");
          showToast("Invitation link copied! ✨");
        } catch {
          showToast("Could not copy link — please copy manually.", "error");
        }
        document.body.removeChild(ta);
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   12. GALLERY LIGHTBOX
   Builds a full-screen lightbox overlay on first call.
   Supports: click to open, prev/next, keyboard (←→ Esc),
   backdrop click to close, focus management, ARIA.
════════════════════════════════════════════════════════════ */

function initGallery() {
  const items = $$(".gallery-item");
  if (!items.length) return;

  /* ── Build overlay DOM ──────────────────── */
  const lb = document.createElement("div");
  lb.id = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Photo viewer");
  lb.setAttribute("aria-hidden", "true");
  lb.innerHTML = /* html */ `
    <div class="lightbox__backdrop"></div>
    <div class="lightbox__stage">
      <button type="button" class="lightbox__close" aria-label="Close photo viewer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <line x1="18" y1="6"  x2="6"  y2="18"/>
          <line x1="6"  y1="6"  x2="18" y2="18"/>
        </svg>
      </button>
      <button type="button" class="lightbox__prev" aria-label="Previous photo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button type="button" class="lightbox__next" aria-label="Next photo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
      <div  class="lightbox__media" aria-live="polite" aria-atomic="true"></div>
      <p    class="lightbox__caption"></p>
    </div>
  `;
  document.body.appendChild(lb);

  const mediaEl = lb.querySelector(".lightbox__media");
  const captionEl = lb.querySelector(".lightbox__caption");
  const closeBtn = lb.querySelector(".lightbox__close");
  const prevBtn = lb.querySelector(".lightbox__prev");
  const nextBtn = lb.querySelector(".lightbox__next");
  const backdrop = lb.querySelector(".lightbox__backdrop");

  let current = 0;
  let prevFocus = null;

  /* ── Render a specific item ─────────────── */
  const render = (idx) => {
    const item = items[idx];
    const img = item.querySelector("img");
    const cap = item.querySelector(".gallery-item__caption");

    mediaEl.innerHTML = "";

    if (img) {
      const clone = img.cloneNode(true);
      clone.className = "lightbox__img";
      clone.setAttribute("alt", img.alt || (cap ? cap.textContent.trim() : ""));
      mediaEl.appendChild(clone);
    } else {
      // Gradient placeholder — mirrors .gallery-item__img nth-child styling
      const ph = document.createElement("div");
      ph.className = `lightbox__placeholder lightbox__placeholder--${idx + 1}`;
      mediaEl.appendChild(ph);
    }

    captionEl.textContent = cap ? cap.textContent.trim() : "";

    // Update prev/next disabled state for single-item galleries
    prevBtn.disabled = items.length < 2;
    nextBtn.disabled = items.length < 2;
  };

  /* ── Open ───────────────────────────────── */
  const open = (idx) => {
    prevFocus = document.activeElement;
    current = clamp(idx, 0, items.length - 1);
    render(current);
    lb.setAttribute("aria-hidden", "false");
    lb.classList.add("is-open");
    document.body.classList.add("modal-open");
    closeBtn.focus();
  };

  /* ── Close ──────────────────────────────── */
  const close = () => {
    lb.setAttribute("aria-hidden", "true");
    lb.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    if (prevFocus && typeof prevFocus.focus === "function") {
      prevFocus.focus();
      prevFocus = null;
    }
  };

  const prev = () => {
    current = (current - 1 + items.length) % items.length;
    render(current);
  };
  const next = () => {
    current = (current + 1) % items.length;
    render(current);
  };

  /* ── Wire gallery items ─────────────────── */
  items.forEach((item, i) => {
    item.addEventListener("click", () => open(i));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(i);
      }
    });
  });

  /* ── Wire lightbox controls ─────────────── */
  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);
  backdrop.addEventListener("click", close);

  /* ── Keyboard navigation ────────────────── */
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") {
      close();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   13. RSVP FORM — Validation + Submission
   Validates required fields inline (on blur + on submit).
   POSTs to form.action via fetch if an endpoint is set;
   otherwise enters demo mode and shows the success state.
   No endpoint is configured yet — client must supply one
   (e.g. Formspree, EmailJS, Google Sheets webhook).
════════════════════════════════════════════════════════════ */

function initRSVP() {
  const form = $("#rsvp-form");
  const success = $("#rsvp-success");
  if (!form) return;

  /* ── Field references ───────────────────── */
  const nameInput = $("#rsvp-name");
  const nameErr = $("#rsvp-name-error");
  const guestsInput = $("#rsvp-guests");
  const guestsErr = $("#rsvp-guests-error");
  const summary = $("#rsvp-validation-summary");
  const submitBtn = form.querySelector('[type="submit"]');

  /* ── Inline helpers ─────────────────────── */
  const setErr = (input, errEl, msg) => {
    if (!input) return;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (errEl) errEl.textContent = msg;
  };

  const clearErr = (input, errEl) => setErr(input, errEl, "");

  const validateName = () => {
    const v = nameInput ? nameInput.value.trim() : "";
    if (!v) {
      setErr(nameInput, nameErr, "Please enter your full name.");
      return false;
    }
    clearErr(nameInput, nameErr);
    return true;
  };

  const validateGuests = () => {
    const v = guestsInput ? parseInt(guestsInput.value, 10) : 1;
    if (isNaN(v) || v < 1) {
      setErr(guestsInput, guestsErr, "Please enter at least 1 guest.");
      return false;
    }
    if (v > 10) {
      setErr(guestsInput, guestsErr, "Maximum 10 guests per RSVP.");
      return false;
    }
    clearErr(guestsInput, guestsErr);
    return true;
  };

  /* ── Live validation (blur) ─────────────── */
  if (nameInput) {
    nameInput.addEventListener("blur", validateName);
    nameInput.addEventListener("input", () => clearErr(nameInput, nameErr));
  }
  if (guestsInput) {
    guestsInput.addEventListener("blur", validateGuests);
    guestsInput.addEventListener("input", () =>
      clearErr(guestsInput, guestsErr),
    );
  }

  /* ── Submit ─────────────────────────────── */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameOk = validateName();
    const guestsOk = validateGuests();

    if (!nameOk || !guestsOk) {
      if (summary)
        summary.textContent =
          "Please correct the highlighted fields and try again.";
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    if (summary) summary.textContent = "";

    // Disable submit button while in flight
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    const action = (form.getAttribute("action") || "").trim();
    const isDemo = !action || action === window.location.href || action === "#";

    if (isDemo) {
      // No endpoint yet — demo mode
      setTimeout(showSuccess, 900);
      return;
    }

    try {
      const res = await fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        showSuccess();
      } else {
        throw new Error(`Server responded ${res.status}`);
      }
    } catch (err) {
      showToast("Could not send your RSVP. Please try again.", "error");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send RSVP";
      }
    }
  });

  /* ── Show success state ─────────────────── */
  function showSuccess() {
    form.classList.add("is-hidden");
    form.setAttribute("aria-hidden", "true");

    if (success) {
      success.classList.remove("is-hidden");
      success.setAttribute("aria-hidden", "false");
      // Move focus to success message for screen readers
      success.setAttribute("tabindex", "-1");
      success.focus();
    }
  }
}

/* ═══════════════════════════════════════════════════════════
   BOOTSTRAP
   Script is loaded with `defer` so the DOM is always ready
   when this executes. Init order mirrors visual hierarchy.
════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initHeader();
  initMobileNav();
  initNavigation();
  initScrollIndicator();
  initScrollReveal();
  initCountdown();
  initMusicPlayer();
  // initModals is an IIFE — already executed at parse time
  initClipboard();
  initGallery();
  initRSVP();
});
