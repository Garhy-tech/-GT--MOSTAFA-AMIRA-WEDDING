import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.env.MOHAMED_A_QA_URL || 'http://127.0.0.1:4173/projects/mohamed-a-2026/index.html';
const browser = await chromium.launch({ headless: true });

async function readDownload(download) {
  const path = await download.path();
  assert.ok(path, 'download must have a local path');
  return fs.readFile(path, 'utf8');
}

try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
    acceptDownloads: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 16; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
  });
  const page = await context.newPage();
  const response = await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(response?.status(), 200);
  await page.locator('[data-enter]').click();
  await page.waitForTimeout(700);

  const [hennaDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('[data-calendar="henna"]').click()
  ]);
  assert.equal(hennaDownload.suggestedFilename(), 'mohamed-a-henna-2026.ics');
  const hennaIcs = await readDownload(hennaDownload);
  assert.match(hennaIcs, /BEGIN:VCALENDAR/);
  assert.match(hennaIcs, /DTSTART;VALUE=DATE:20260903/);
  assert.match(hennaIcs, /DTEND;VALUE=DATE:20260904/);
  assert.match(hennaIcs, /SUMMARY:ليلة حنة MOHAMED × A/);
  assert.match(hennaIcs, /LOCATION:\r?\n/);

  const [weddingDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('[data-calendar="wedding"]').click()
  ]);
  assert.equal(weddingDownload.suggestedFilename(), 'mohamed-a-wedding-2026.ics');
  const weddingIcs = await readDownload(weddingDownload);
  assert.match(weddingIcs, /DTSTART;VALUE=DATE:20260904/);
  assert.match(weddingIcs, /DTEND;VALUE=DATE:20260905/);
  assert.match(weddingIcs, /SUMMARY:ليلة زفاف MOHAMED × A/);
  assert.match(weddingIcs, /LOCATION:قاعة شهرزاد — سنورس — الفيوم/);

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async data => { window.__garhySharePayload = { title: data.title, text: data.text, url: data.url }; }
    });
  });
  await page.locator('.hero-share').click();
  const shared = await page.evaluate(() => window.__garhySharePayload);
  assert.deepEqual(shared, {
    title: 'MOHAMED × A — GARHY Invite',
    text: 'ليلة الحنة 03/09/2026 • ليلة الزفاف 04/09/2026',
    url: page.url()
  });

  assert.equal(await page.locator('[data-beat-toggle]').getAttribute('aria-pressed'), 'false', 'audio must remain off unless the guest explicitly enables it');
  await context.close();
} finally {
  await browser.close();
}

console.log('MOHAMED × A calendar/share functional QA passed');
