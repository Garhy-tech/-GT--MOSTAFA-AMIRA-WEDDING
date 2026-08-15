/*!
 * GARHY INVITE — Mostafa & Amira flagship experience
 * Productization layer v1.0
 *
 * This file intentionally keeps the legacy static site deployable while
 * introducing reusable event lifecycle, guest personalization, smart mobile
 * actions, RSVP state, guest-pass primitives and lightweight analytics.
 */

'use strict';

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const GARHY_EVENT = Object.freeze({
  id: 'mostafa-amira-2026',
  product: 'GARHY INVITE',
  type: 'wedding',
  locale: 'ar-EG',
  timezone: 'Africa/Cairo',
  title: 'Mostafa & Amira',
  titleAr: 'مصطفى وأميرة',
  startsAt: '2026-07-31T19:00:00+03:00',
  endsAt: '2026-07-31T23:30:00+03:00',
  venue: {
    name: 'Dar Al Eshara',
    nameAr: 'دار الإشارة',
    city: 'Cairo',
    cityAr: 'القاهرة',
    mapsUrl: 'https://maps.app.goo.gl/BzxKEpQVtUCoLMjm7?g_st=afm'
  },
  lifecycle: {
    finalHours: 72,
    thankYouDays: 30
  }
});

const state = {
  guestName: '',
  inviteToken: '',
  lifecycle: 'upcoming',
  rsvp: null,
  guestPass: null
};

function safeText(value, max = 80) {
  return String(value || '')
    .replace(/[<>\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function isArabic() {
  return (document.documentElement.lang || '').toLowerCase().startsWith('ar');
}

function t(ar, en) {
  return isArabic() ? ar : en;
}

function getLifecycle(now = Date.now()) {
  const start = new Date(GARHY_EVENT.startsAt).getTime();
  const end = new Date(GARHY_EVENT.endsAt).getTime();
  const finalWindow = GARHY_EVENT.lifecycle.finalHours * 60 * 60 * 1000;
  const thankYouWindow = GARHY_EVENT.lifecycle.thankYouDays * 24 * 60 * 60 * 1000;

  if (now < start - finalWindow) return 'upcoming';
  if (now < start) return 'final-countdown';
  if (now <= end) return 'live';
  if (now <= end + thankYouWindow) return 'thank-you';
  return 'archive';
}

function parseGuestContext() {
  const params = new URLSearchParams(window.location.search);
  const name = safeText(params.get('guest') || params.get('name'));
  const token = safeText(params.get('invite') || params.get('token'), 160);

  state.guestName = name || safeText(localStorage.getItem('garhy-invite:guest-name'));
  state.inviteToken = token || safeText(localStorage.getItem('garhy-invite:token'), 160);

  if (name) localStorage.setItem('garhy-invite:guest-name', name);
  if (token) localStorage.setItem('garhy-invite:token', token);
}

function track(eventName, detail = {}) {
  const payload = {
    event: `garhy_invite_${eventName}`,
    eventId: GARHY_EVENT.id,
    eventType: GARHY_EVENT.type,
    lifecycle: state.lifecycle,
    hasInviteToken: Boolean(state.inviteToken),
    ...detail
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent('garhy:invite', { detail: payload }));
}

function injectProductStyles() {
  if ($('#garhy-invite-product-styles')) return;
  const style = document.createElement('style');
  style.id = 'garhy-invite-product-styles';
  style.textContent = `
    .garhy-guest-welcome{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 82px);transform:translateX(-50%);z-index:9990;max-width:min(92vw,560px);padding:10px 16px;border:1px solid rgba(255,255,255,.28);border-radius:999px;background:rgba(18,53,46,.88);color:#fff;box-shadow:0 12px 34px rgba(10,34,29,.22);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);font:600 13px/1.5 system-ui,-apple-system,sans-serif;letter-spacing:.01em;text-align:center;opacity:0;animation:garhyWelcome .55s ease .2s forwards}
    .garhy-lifecycle-card{margin:24px auto 0;max-width:680px;padding:18px 20px;border:1px solid rgba(126,93,64,.18);border-radius:18px;background:rgba(255,255,255,.72);box-shadow:0 18px 44px rgba(25,59,50,.08);backdrop-filter:blur(10px);text-align:center}
    .garhy-lifecycle-card strong{display:block;margin-bottom:5px;font-size:clamp(18px,3.5vw,24px)}
    .garhy-lifecycle-card span{display:block;opacity:.76;line-height:1.7}
    .garhy-smart-dock{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9980;display:none;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;width:min(94vw,430px);padding:7px;border:1px solid rgba(255,255,255,.25);border-radius:22px;background:rgba(18,53,46,.92);box-shadow:0 16px 45px rgba(8,30,25,.3);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);transition:transform .28s ease,opacity .28s ease}
    .garhy-smart-dock a,.garhy-smart-dock button{min-height:48px;border:0;border-radius:16px;background:transparent;color:#fff;display:flex;align-items:center;justify-content:center;gap:7px;padding:8px 10px;text-decoration:none;font:600 12px/1.2 system-ui,-apple-system,sans-serif;cursor:pointer}
    .garhy-smart-dock .is-primary{background:#f1e5d4;color:#173d35}
    .garhy-smart-dock.is-compact{transform:translate(-50%,8px);opacity:.93}
    .garhy-rsvp-closed{margin:0 0 18px;padding:14px 16px;border-radius:14px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);line-height:1.7;text-align:center}
    .garhy-pass-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}
    @keyframes garhyWelcome{to{opacity:1;transform:translate(-50%,0)}}
    @media(max-width:780px){.garhy-smart-dock{display:grid}body{padding-bottom:84px}.mobile-dock{display:none!important}}
    @media(prefers-reduced-motion:reduce){.garhy-guest-welcome{animation:none;opacity:1}.garhy-smart-dock{transition:none}}
  `;
  document.head.appendChild(style);
}

function initLoader() {
  const loader = $('#loader');
  const ready = () => document.body.classList.add('is-loaded');
  if (!loader) return ready();

  const dismiss = () => {
    loader.classList.add('loader--hidden');
    setTimeout(() => {
      loader.remove();
      ready();
    }, 650);
  };

  if (document.readyState === 'complete') dismiss();
  else window.addEventListener('load', dismiss, { once: true });
  setTimeout(dismiss, 5500);
}

function initHeader() {
  const header = $('#site-header') || $('[data-header]');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 48);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initMobileNavigation() {
  const toggle = $('.site-header__menu-toggle');
  const nav = $('#site-nav ul');
  if (!toggle || !nav) return;

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });
  $$('a', nav).forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });
}

function initSmoothNavigation() {
  const header = $('#site-header') || $('[data-header]');
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const id = link.getAttribute('href').slice(1);
      const target = id && document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      const offset = (header?.offsetHeight || 0) + 10;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
      track('navigation', { target: id });
    });
  });
}

function initReveal() {
  const items = $$('[data-reveal], .reveal');
  if (!items.length) return;
  if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('is-revealed', 'is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed', 'is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .1, rootMargin: '0px 0px -42px' });
  items.forEach(item => observer.observe(item));
}

function initCountdown() {
  const fields = {
    days: $('[data-countdown="days"]'),
    hours: $('[data-countdown="hours"]'),
    minutes: $('[data-countdown="minutes"]'),
    seconds: $('[data-countdown="seconds"]')
  };
  if (!Object.values(fields).some(Boolean)) return;

  const start = new Date(GARHY_EVENT.startsAt).getTime();
  const tick = () => {
    const seconds = Math.max(0, Math.floor((start - Date.now()) / 1000));
    const values = {
      days: Math.floor(seconds / 86400),
      hours: Math.floor((seconds % 86400) / 3600),
      minutes: Math.floor((seconds % 3600) / 60),
      seconds: seconds % 60
    };
    Object.entries(values).forEach(([key, value]) => {
      if (fields[key]) fields[key].textContent = String(value).padStart(2, '0');
    });
  };
  tick();
  setInterval(tick, 1000);
}

function showToast(message, type = 'info') {
  let region = $('#toast-region') || $('[data-toast]');
  if (!region) {
    region = document.createElement('div');
    region.id = 'toast-region';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
  }

  if (region.matches('[data-toast]')) {
    region.textContent = message;
    region.hidden = false;
    region.classList.add('is-visible');
    setTimeout(() => region.classList.remove('is-visible'), 3000);
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  region.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

async function shareInvite() {
  const title = `${GARHY_EVENT.title} — ${GARHY_EVENT.product}`;
  const text = t('دعوة خاصة لمشاركة هذه المناسبة', 'A private invitation to celebrate this occasion');
  const url = new URL(window.location.href);
  url.searchParams.delete('guest');
  url.searchParams.delete('name');

  try {
    if (navigator.share) {
      await navigator.share({ title, text, url: url.toString() });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url.toString());
      showToast(t('تم نسخ رابط الدعوة', 'Invitation link copied'));
    }
    track('share');
  } catch (error) {
    if (error?.name !== 'AbortError') showToast(t('تعذرت المشاركة', 'Could not share'), 'error');
  }
}

function initShareActions() {
  $$('[data-share-invitation], [data-copy-link]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      shareInvite();
    });
  });

  const modal = $('#global-modal');
  $$('[data-modal-close]').forEach(button => button.addEventListener('click', () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }));
}

function initMusic() {
  const audio = $('#music-audio') || $('[data-music-audio]');
  const button = $('.btn-music') || $('[data-music-toggle]');
  if (!audio || !button) return;

  audio.volume = .55;
  const sync = () => {
    const playing = !audio.paused;
    button.classList.toggle('is-playing', playing);
    button.setAttribute('aria-pressed', String(playing));
  };
  button.addEventListener('click', async () => {
    try {
      if (audio.paused) await audio.play();
      else audio.pause();
    } catch {
      showToast(t('تعذر تشغيل الموسيقى على هذا الجهاز', 'Audio could not be played'), 'error');
    }
  });
  audio.addEventListener('play', sync);
  audio.addEventListener('pause', sync);
  sync();
}

function initGallery() {
  const items = $$('.gallery-item, [data-gallery-index]');
  const dialog = $('[data-lightbox]');
  if (!items.length || !dialog || !dialog.showModal) return;

  const image = $('[data-lightbox-image]', dialog);
  const caption = $('[data-lightbox-caption]', dialog);
  let active = 0;

  const render = index => {
    active = (index + items.length) % items.length;
    const source = $('img', items[active]);
    if (!source || !image) return;
    image.src = source.currentSrc || source.src;
    image.alt = source.alt || '';
    if (caption) caption.textContent = $('figcaption, span', items[active])?.textContent || '';
  };

  items.forEach((item, index) => item.addEventListener('click', () => {
    render(index);
    dialog.showModal();
    track('gallery_open', { index });
  }));
  $('[data-lightbox-close]', dialog)?.addEventListener('click', () => dialog.close());
  $('[data-lightbox-prev]', dialog)?.addEventListener('click', () => render(active - 1));
  $('[data-lightbox-next]', dialog)?.addEventListener('click', () => render(active + 1));
}

function createGuestPass(name) {
  const seed = `${GARHY_EVENT.id}|${state.inviteToken}|${name}|${Date.now()}`;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const code = `GT-${Math.abs(hash >>> 0).toString(36).toUpperCase().padStart(7, '0')}`;
  const pass = { code, eventId: GARHY_EVENT.id, guestName: name, createdAt: new Date().toISOString() };
  localStorage.setItem('garhy-invite:guest-pass', JSON.stringify(pass));
  return pass;
}

function initRsvp() {
  const form = $('#rsvp-form');
  if (!form) return;

  const existing = localStorage.getItem('garhy-invite:rsvp');
  try { state.rsvp = existing ? JSON.parse(existing) : null; } catch { state.rsvp = null; }
  try { state.guestPass = JSON.parse(localStorage.getItem('garhy-invite:guest-pass') || 'null'); } catch { state.guestPass = null; }

  if (['thank-you', 'archive'].includes(state.lifecycle)) {
    const note = document.createElement('div');
    note.className = 'garhy-rsvp-closed';
    note.innerHTML = `<strong>${t('شكرًا لمشاركتكم فرحتنا', 'Thank you for celebrating with us')}</strong><br>${t('انتهت فترة تأكيد الحضور لهذه المناسبة.', 'RSVP for this event is now closed.')}`;
    form.prepend(note);
    $$('input, select, textarea, button[type="submit"]', form).forEach(control => { control.disabled = true; });
    return;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = safeText(data.get('name') || data.get('guest_name'), 100);
    if (!name) {
      showToast(t('يرجى كتابة الاسم', 'Please enter your name'), 'error');
      return;
    }

    const attendance = safeText(data.get('attendance') || 'attending', 20);
    const payload = {
      eventId: GARHY_EVENT.id,
      guestName: name,
      attendance,
      guests: Number(data.get('guests') || 1),
      message: safeText(data.get('message'), 500),
      submittedAt: new Date().toISOString()
    };

    state.rsvp = payload;
    localStorage.setItem('garhy-invite:rsvp', JSON.stringify(payload));
    if (attendance !== 'declining') state.guestPass = createGuestPass(name);

    showToast(t('تم تسجيل ردك بنجاح', 'Your RSVP has been saved'), 'success');
    track('rsvp_submit', { attendance, guestCount: payload.guests });

    const success = $('#rsvp-success') || $('[data-rsvp-success]');
    if (success) {
      form.hidden = true;
      success.hidden = false;
      success.removeAttribute('aria-hidden');
      const codeHost = document.createElement('p');
      if (state.guestPass) {
        codeHost.innerHTML = `${t('رمز بطاقة الضيف', 'Guest pass')}: <strong class="garhy-pass-code">${state.guestPass.code}</strong>`;
        success.appendChild(codeHost);
      }
    }
  });
}

function lifecycleCopy() {
  switch (state.lifecycle) {
    case 'final-countdown':
      return {
        title: t('اقترب موعدنا', 'Almost time'),
        body: t('راجع تفاصيل المكان وموعد الوصول قبل انطلاق ليلة العمر.', 'Review the venue and arrival details before the celebration begins.')
      };
    case 'live':
      return {
        title: t('اليوم موعدنا', 'Today is the day'),
        body: t('يسعدنا وجودكم معنا. استخدم زر المكان للوصول مباشرة.', 'We are delighted to have you with us. Use Venue for directions.')
      };
    case 'thank-you':
      return {
        title: t('شكرًا من القلب', 'Thank you'),
        body: t('وجودكم جعل الذكرى أجمل. تبقى هذه الدعوة مساحة للاحتفاظ باللحظات.', 'Your presence made the memory even more special. This invitation now preserves the moments.')
      };
    case 'archive':
      return {
        title: t('ذكرى محفوظة', 'A preserved memory'),
        body: t('تحولت الدعوة إلى صفحة تذكارية للمناسبة.', 'The invitation is now a permanent event keepsake.')
      };
    default:
      return {
        title: t('يسعدنا أن تكونوا معنا', 'We would love to celebrate with you'),
        body: t('يمكنكم مراجعة التفاصيل وتأكيد الحضور من هذه الدعوة.', 'Review the details and confirm attendance from this invitation.')
      };
  }
}

function initLifecycleExperience() {
  state.lifecycle = getLifecycle();
  document.documentElement.dataset.eventLifecycle = state.lifecycle;

  const hero = $('#hero') || $('main section');
  if (hero && !$('.garhy-lifecycle-card', hero)) {
    const copy = lifecycleCopy();
    const card = document.createElement('div');
    card.className = 'garhy-lifecycle-card';
    card.innerHTML = `<strong>${copy.title}</strong><span>${copy.body}</span>`;
    const inner = $('.hero__content, .hero__copy, .section__inner', hero) || hero;
    inner.appendChild(card);
  }

  track('lifecycle_view');
}

function initGuestPersonalization() {
  if (!state.guestName) return;
  const welcome = document.createElement('div');
  welcome.className = 'garhy-guest-welcome';
  welcome.setAttribute('role', 'status');
  welcome.textContent = t(`أهلًا ${state.guestName} — هذه الدعوة أُعدت لك`, `Welcome ${state.guestName} — this invitation is for you`);
  document.body.appendChild(welcome);
  setTimeout(() => welcome.remove(), 7000);
  track('personalized_view');
}

function initSmartDock() {
  if ($('.garhy-smart-dock')) return;
  const dock = document.createElement('nav');
  dock.className = 'garhy-smart-dock';
  dock.setAttribute('aria-label', t('إجراءات سريعة', 'Quick actions'));

  const thirdAction = ['thank-you', 'archive'].includes(state.lifecycle)
    ? `<button type="button" class="is-primary" data-garhy-share>↗ <span>${t('مشاركة', 'Share')}</span></button>`
    : `<a class="is-primary" href="#rsvp">♥ <span>${t('الحضور', 'RSVP')}</span></a>`;

  dock.innerHTML = `
    <a href="#the-event">✦ <span>${t('التفاصيل', 'Details')}</span></a>
    <a href="#location">⌖ <span>${t('المكان', 'Venue')}</span></a>
    ${thirdAction}
  `;
  document.body.appendChild(dock);
  $('[data-garhy-share]', dock)?.addEventListener('click', shareInvite);

  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    dock.classList.toggle('is-compact', currentY > lastY && currentY > 160);
    lastY = currentY;
  }, { passive: true });
}

function initMapsTracking() {
  $$('a[href*="maps"], a[href*="google.com/maps"]').forEach(link => {
    link.addEventListener('click', () => track('venue_open'));
  });
}

function initAccessibility() {
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const dialog = $('dialog[open]');
    if (dialog?.close) dialog.close();
  });
}

function boot() {
  parseGuestContext();
  state.lifecycle = getLifecycle();
  injectProductStyles();
  initLoader();
  initHeader();
  initMobileNavigation();
  initSmoothNavigation();
  initReveal();
  initCountdown();
  initMusic();
  initGallery();
  initShareActions();
  initLifecycleExperience();
  initGuestPersonalization();
  initSmartDock();
  initRsvp();
  initMapsTracking();
  initAccessibility();

  window.GARHY_INVITE = Object.freeze({
    event: GARHY_EVENT,
    getLifecycle,
    getGuestPass: () => state.guestPass,
    getRsvp: () => state.rsvp,
    track,
    version: '1.0.0-productization'
  });

  track('boot', { personalized: Boolean(state.guestName) });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
