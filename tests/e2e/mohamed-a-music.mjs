import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.MOHAMED_A_QA_URL || 'http://127.0.0.1:4173/projects/mohamed-a-2026/index.html';
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await context.addInitScript(() => {
    window.__vibrationCalls = [];
    try {
      Object.defineProperty(navigator, 'vibrate', {
        configurable: true,
        value: pattern => { window.__vibrationCalls.push(pattern); return true; }
      });
    } catch {}
  });
  const page = await context.newPage();
  const musicRequests = [];
  const chimeRequests = [];
  const adRequests = [];
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/media/jamaican-bam-bam.ogg')) musicRequests.push(url);
    if (url.includes('/media/cha-ching.ogg')) chimeRequests.push(url);
    if (url.includes('/media/ads/gt-ad-strip.b64')) adRequests.push(url);
  });

  await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(musicRequests.length, 0, 'background music must remain network-idle before the first gesture');
  assert.equal(chimeRequests.length, 0, 'Cha-Ching must remain network-idle before the first gesture');
  assert.equal(await page.evaluate(() => window.__garhyAudio?.music === null), true, 'music element must be lazily created only after a gesture');

  const musicResponse = page.waitForResponse(response =>
    response.url().includes('/media/jamaican-bam-bam.ogg') && [200, 206].includes(response.status()),
    { timeout: 6000 }
  );
  const chimeResponse = page.waitForResponse(response =>
    response.url().includes('/media/cha-ching.ogg') && [200, 206].includes(response.status()),
    { timeout: 6000 }
  );

  await page.locator('[data-enter]').click();
  await Promise.all([musicResponse, chimeResponse]);
  await page.locator('#hero-title').waitFor({ state: 'visible' });
  assert.ok(musicRequests.length >= 1, 'Jamaican soundtrack must start loading on the first user gesture');
  assert.ok(chimeRequests.length >= 1, 'Cha-Ching must fire on the entry button');
  const configured = await page.evaluate(() => {
    const music = window.__garhyAudio?.music;
    return music ? {
      isMedia: music instanceof HTMLMediaElement,
      src: music.getAttribute('src'),
      loop: music.loop,
      volume: music.volume,
      preload: music.preload
    } : null;
  });
  assert.equal(configured?.isMedia, true, 'first gesture must create a real HTML media element');
  assert.equal(configured?.src, './media/jamaican-bam-bam.ogg', 'music element must point at the local soundtrack');
  assert.equal(configured?.loop, true, 'background soundtrack must loop');
  assert.equal(configured?.preload, 'none', 'soundtrack must preserve lazy preload policy');
  assert.ok(Math.abs((configured?.volume ?? 0) - 0.56) < 0.001, 'soundtrack volume must retain the intended mix');
  assert.ok(await page.evaluate(() => (window.__vibrationCalls || []).length >= 1), 'entry button must request vibration feedback');

  const music = page.locator('[data-music-toggle]');
  await music.waitFor({ state: 'visible' });

  // GitHub headless runners have no guaranteed audio sink. The real network/media
  // contract is verified above; patch only play/pause state transitions here so the
  // UI control semantics remain deterministic without pretending to test speakers.
  await page.evaluate(() => {
    const audio = window.__garhyAudio.music;
    window.__qaMediaPaused = false;
    Object.defineProperty(audio, 'paused', { configurable: true, get: () => window.__qaMediaPaused });
    audio.play = async () => {
      window.__qaMediaPaused = false;
      window.__garhyAudio.started = true;
      audio.dispatchEvent(new Event('play'));
    };
    audio.pause = () => {
      window.__qaMediaPaused = true;
      window.__garhyAudio.started = false;
      audio.dispatchEvent(new Event('pause'));
    };
    audio.dispatchEvent(new Event('play'));
  });
  await page.waitForFunction(() => document.querySelector('[data-music-toggle]')?.getAttribute('aria-pressed') === 'true');

  const before = await page.evaluate(() => ({ fx: window.__garhyAudio.fxCount, vibrations: window.__vibrationCalls.length }));
  await page.locator('[data-share]').first().click();
  const after = await page.evaluate(() => ({ fx: window.__garhyAudio.fxCount, vibrations: window.__vibrationCalls.length }));
  assert.ok(after.fx > before.fx, 'every action click must trigger Cha-Ching feedback');
  assert.ok(after.vibrations > before.vibrations, 'every action click must request vibration feedback');

  await music.click();
  assert.equal(await music.getAttribute('aria-pressed'), 'false', 'music button must pause the background song');
  await music.click();
  assert.equal(await music.getAttribute('aria-pressed'), 'true', 'music button must resume the background song');

  const ads = page.locator('[data-gt-ads]');
  await ads.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-gt-ads]')?.dataset.adsReady === 'true', null, { timeout: 6000 });
  assert.equal(await page.locator('[data-gt-ad-image]').count(), 2, 'professional marquee must use two seamless strip copies');
  assert.equal(adRequests.length, 1, 'ad strip must lazy-load one compact local base64 asset only near the end of the page');
  const src = await page.locator('[data-gt-ad-image]').first().getAttribute('src');
  assert.ok(src?.startsWith('blob:'), 'ad strip must reconstruct the local WebP bytes into a browser-safe Blob URL');
  await context.close();
} finally {
  await browser.close();
}

console.log('MOHAMED × A first-gesture media network, controls, Cha-Ching, vibration and ad marquee QA passed');