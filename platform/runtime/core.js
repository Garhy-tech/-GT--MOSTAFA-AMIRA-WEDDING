(() => {
  'use strict';

  const DAY = 86_400_000;

  function dateMs(value) {
    const ms = Date.parse(value || '');
    return Number.isFinite(ms) ? ms : null;
  }

  function resolveLifecycle(event, now = Date.now()) {
    const start = dateMs(event.startsAt);
    const end = dateMs(event.endsAt);
    if (start === null || end === null) return 'unknown';
    if (now < start - 7 * DAY) return 'upcoming';
    if (now < start) return 'final-countdown';
    if (now <= end) return 'live';
    const archiveAfterDays = Number.isFinite(Number(event.archiveAfterDays)) ? Number(event.archiveAfterDays) : 45;
    if (now <= end + archiveAfterDays * DAY) return 'thank-you';
    return 'archive';
  }

  function isRsvpOpen(event, now = Date.now()) {
    const opens = dateMs(event.rsvpOpensAt);
    const closes = dateMs(event.rsvpClosesAt);
    if (opens !== null && now < opens) return false;
    if (closes !== null && now > closes) return false;
    const lifecycle = resolveLifecycle(event, now);
    return lifecycle === 'upcoming' || lifecycle === 'final-countdown';
  }

  function inviteTokenFromLocation(location = window.location) {
    const params = new URLSearchParams(location.search);
    const queryToken = params.get('invite');
    if (queryToken && /^[A-Za-z0-9_-]{24,256}$/.test(queryToken)) return queryToken;
    const match = location.pathname.match(/\/i\/([A-Za-z0-9_-]{24,256})\/?$/);
    return match ? match[1] : null;
  }

  function safeLocale(value, fallback = 'ar') {
    return value === 'en' || value === 'ar' ? value : fallback;
  }

  function createClient(config) {
    const url = String(config?.url || '').replace(/\/+$/, '');
    const key = String(config?.publishableKey || '');
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) || !key) return null;

    async function rpc(name, body) {
      const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body || {})
      });
      if (!response.ok) {
        const error = new Error(`RPC_${name}_${response.status}`);
        error.status = response.status;
        throw error;
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }

    return {
      rpc,
      getPublicEvent: slug => rpc('get_public_event', { p_slug: slug }),
      resolveInvitation: token => rpc('resolve_invitation', { p_token: token }),
      submitRsvp: ({ token, attendance, guestCount, message, locale }) => rpc('submit_invitation_rsvp', {
        p_token: token,
        p_attendance: attendance,
        p_guest_count: guestCount,
        p_message: message || null,
        p_locale: safeLocale(locale)
      }),
      track: ({ token, eventName, locale, properties = {} }) => rpc('track_invitation_event', {
        p_token: token,
        p_event_name: eventName,
        p_locale: safeLocale(locale),
        p_properties: properties
      })
    };
  }

  function emit(name, detail = {}) {
    window.dispatchEvent(new CustomEvent(`garhy-invite:${name}`, { detail }));
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: `garhy_invite_${name}`, ...detail });
  }

  window.GarhyInviteCore = Object.freeze({
    resolveLifecycle,
    isRsvpOpen,
    inviteTokenFromLocation,
    safeLocale,
    createClient,
    emit
  });
})();
