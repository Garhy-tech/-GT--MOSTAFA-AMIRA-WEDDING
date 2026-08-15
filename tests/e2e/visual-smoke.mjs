import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE = process.env.GARHY_INVITE_QA_URL || 'http://127.0.0.1:4173/app-v2/index.html';
const ORIGIN = new URL(BASE).origin;
const ARTIFACT_DIR = process.env.GARHY_INVITE_ARTIFACT_DIR || 'artifacts/browser-qa';
await mkdir(ARTIFACT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });

function isBenignMediaFallbackAbort(url, errorText) {
  const path = new URL(url).pathname;
  return errorText === 'net::ERR_ABORTED' && /^\/assets\/v2\/audio\/daweta-zewace\.(?:m4a|mp3)$/.test(path);
}

async function assertBinaryAsset(page, path, minimumBytes, name) {
  const response = await page.request.get(`${ORIGIN}${path}`);
  assert.equal(response.status(), 200, `${name}: ${path} must return 200`);
  const body = await response.body();
  assert.ok(body.byteLength > minimumBytes, `${name}: ${path} is unexpectedly small (${body.byteLength} bytes)`);
}

async function revealEverySection(page, name) {
  const reveals = page.locator('.reveal');
  const count = await reveals.count();
  for (let i = 0; i < count; i += 1) {
    const item = reveals.nth(i);
    await item.scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(180);
  const hiddenRevealCount = await page.locator('.reveal:not(.is-visible)').count();
  assert.equal(hiddenRevealCount, 0, `${name}: every reveal element must become visible after entering the viewport`);
  return count;
}

async function inspectPage({ name, width, height }) {
  const context = await browser.newContext({ viewport: { width, height }, locale: 'ar-EG' });
  const page = await context.newPage();
  const errors = [];
  const failedLocalRequests = [];

  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('requestfailed', request => {
    const url = request.url();
    const errorText = request.failure()?.errorText || 'failed';
    if (url.startsWith(`${ORIGIN}/`) && !isBenignMediaFallbackAbort(url, errorText)) {
      failedLocalRequests.push(`${request.method()} ${url} — ${errorText}`);
    }
  });

  const response = await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  assert.equal(response?.status(), 200, `${name}: main document must return 200`);
  await page.waitForFunction(() => window.GARHY_INVITE?.version === '2.0.0', null, { timeout: 30_000 });

  assert.match(await page.title(), /Mostafa.*Amira/i, `${name}: title should identify the flagship experience`);
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl', `${name}: Arabic should start RTL`);
  assert.equal(await page.locator('html').getAttribute('lang'), 'ar', `${name}: Arabic should start with lang=ar`);

  const lifecycle = await page.evaluate(() => window.GARHY_INVITE.lifecycle);
  assert.ok(['upcoming', 'final-countdown', 'live', 'thank-you', 'archive'].includes(lifecycle), `${name}: lifecycle must resolve`);
  const fixedLifecycle = await page.evaluate(() => window.GarhyInviteCore.resolveLifecycle(window.GARHY_INVITE.event, Date.parse('2026-08-15T12:00:00+03:00')));
  assert.equal(fixedLifecycle, 'thank-you', `${name}: Aug 15 flagship state should be thank-you`);

  const rsvpOpenAtFixedTime = await page.evaluate(() => window.GarhyInviteCore.isRsvpOpen(window.GARHY_INVITE.event, Date.parse('2026-08-15T12:00:00+03:00')));
  assert.equal(rsvpOpenAtFixedTime, false, `${name}: RSVP must be closed after the event`);
  assert.equal(await page.locator('#rsvp-form').isVisible(), false, `${name}: closed RSVP form must not be visible`);
  assert.equal(await page.locator('[data-rsvp-closed]').isVisible(), true, `${name}: post-event memory state must be visible`);

  const audioSupport = await page.evaluate(() => {
    const audio = document.querySelector('[data-music-audio]');
    if (!(audio instanceof HTMLAudioElement)) return false;
    return Boolean(audio.canPlayType('audio/mp4') || audio.canPlayType('audio/mpeg'));
  });
  assert.equal(audioSupport, true, `${name}: browser must support at least one configured wedding-audio format`);
  await assertBinaryAsset(page, '/assets/v2/audio/daweta-zewace.m4a', 10_000, name);
  await assertBinaryAsset(page, '/assets/v2/audio/daweta-zewace.mp3', 10_000, name);

  await page.locator('[data-language-toggle]').click();
  assert.equal(await page.locator('html').getAttribute('dir'), 'ltr', `${name}: English must switch to LTR`);
  assert.equal(await page.locator('html').getAttribute('lang'), 'en', `${name}: English must switch lang=en`);
  assert.match(await page.locator('[data-i18n="heroInvitation"]').innerText(), /invite|share/i, `${name}: English translation must render`);

  await page.locator('[data-language-toggle]').click();
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl', `${name}: switching back must restore RTL`);

  const galleryItem = page.locator('[data-gallery-index="0"]');
  await galleryItem.scrollIntoViewIfNeeded();
  await galleryItem.click();
  assert.equal(await page.locator('[data-lightbox]').getAttribute('open'), '', `${name}: gallery lightbox must open`);
  await page.locator('[data-lightbox-close]').click();

  const revealCount = await revealEverySection(page, name);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);

  const brokenImages = await page.evaluate(() => [...document.images]
    .filter(img => img.complete && img.naturalWidth === 0)
    .map(img => img.currentSrc || img.src));
  assert.deepEqual(brokenImages, [], `${name}: all loaded images must decode successfully`);

  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  assert.ok(overflow.scrollWidth <= overflow.viewport + 2, `${name}: horizontal overflow detected (${overflow.scrollWidth} > ${overflow.viewport})`);

  await page.screenshot({ path: `${ARTIFACT_DIR}/${name}.png`, fullPage: true });

  assert.deepEqual(failedLocalRequests, [], `${name}: local requests failed:\n${failedLocalRequests.join('\n')}`);
  assert.deepEqual(errors, [], `${name}: browser errors:\n${errors.join('\n')}`);

  const result = { name, lifecycle, revealCount, overflow };
  await context.close();
  return result;
}

try {
  const results = [];
  results.push(await inspectPage({ name: 'desktop-1440', width: 1440, height: 1000 }));
  results.push(await inspectPage({ name: 'mobile-390', width: 390, height: 844 }));
  console.log(JSON.stringify({ ok: true, results }, null, 2));
} finally {
  await browser.close();
}
