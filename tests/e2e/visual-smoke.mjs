import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE = process.env.GARHY_INVITE_QA_URL || 'http://127.0.0.1:4173/app-v2/index.html';
const ARTIFACT_DIR = process.env.GARHY_INVITE_ARTIFACT_DIR || 'artifacts/browser-qa';
await mkdir(ARTIFACT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });

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
    if (url.startsWith('http://127.0.0.1:4173/')) {
      failedLocalRequests.push(`${request.method()} ${url} — ${request.failure()?.errorText || 'failed'}`);
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

  for (let y = 0; y <= await page.evaluate(() => document.body.scrollHeight); y += Math.max(500, height - 120)) {
    await page.evaluate(scrollY => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(90);
  }
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

  await context.close();
  return { name, lifecycle, overflow };
}

try {
  const results = [];
  results.push(await inspectPage({ name: 'desktop-1440', width: 1440, height: 1000 }));
  results.push(await inspectPage({ name: 'mobile-390', width: 390, height: 844 }));
  console.log(JSON.stringify({ ok: true, results }, null, 2));
} finally {
  await browser.close();
}
