import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.MOHAMED_A_QA_URL || 'http://127.0.0.1:4173/projects/mohamed-a-2026/index.html';
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const trackRequests = [];
  page.on('request', request => { if (request.url().includes('/media/daweta-zewace.mp3')) trackRequests.push(request.url()); });

  await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(trackRequests.length, 0, 'soundtrack must not load on the intro screen');

  await page.locator('[data-enter]').click();
  await page.locator('#hero-title').waitFor({ state: 'visible' });
  await page.waitForTimeout(120);
  assert.equal(trackRequests.length, 0, 'soundtrack must remain unloaded after entry until explicit user action');

  const music = page.locator('[data-music-toggle]');
  await music.waitFor({ state: 'visible' });
  assert.equal(await music.getAttribute('aria-pressed'), 'false');
  assert.match(await music.getAttribute('aria-label') || '', /تشغيل أغنية الفرح/);

  const responsePromise = page.waitForResponse(response => response.url().includes('/media/daweta-zewace.mp3') && [200, 206].includes(response.status()), { timeout: 5000 });
  await music.click();
  assert.equal(await music.getAttribute('aria-pressed'), 'true', 'music control must react immediately on first tap');
  await responsePromise;
  assert.equal(trackRequests.length, 1, 'soundtrack should be requested exactly once on first play');

  await music.click();
  assert.equal(await music.getAttribute('aria-pressed'), 'false', 'music control must stop immediately on second tap');
  await context.close();
} finally {
  await browser.close();
}

console.log('MOHAMED × A local soundtrack lazy-load UX QA passed');
