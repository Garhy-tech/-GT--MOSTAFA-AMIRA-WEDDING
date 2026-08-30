import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.env.MOHAMED_A_QA_URL || 'http://127.0.0.1:4173/projects/mohamed-a-2026/index.html';
const viewports = [
  { name: 'mobile-280', width: 280, height: 653, mobile: true },
  { name: 'mobile-320', width: 320, height: 700, mobile: true },
  { name: 'mobile-360', width: 360, height: 800, mobile: true },
  { name: 'mobile-390', width: 390, height: 844, mobile: true },
  { name: 'mobile-412', width: 412, height: 915, mobile: true },
  { name: 'mobile-430', width: 430, height: 932, mobile: true },
  { name: 'tablet-768', width: 768, height: 1024, mobile: false },
  { name: 'desktop-1024', width: 1024, height: 768, mobile: false },
  { name: 'desktop-1440', width: 1440, height: 900, mobile: false }
];

const androidUserAgent = 'Mozilla/5.0 (Linux; Android 16; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36';
await fs.mkdir('artifacts/mohamed-a-qa', { recursive: true });
const browser = await chromium.launch({ headless: true });

function inside(rect, width, height, label, tolerance = 1) {
  assert.ok(rect, `${label}: bounding box must exist`);
  assert.ok(rect.x >= -tolerance, `${label}: clips left at ${rect.x}`);
  assert.ok(rect.x + rect.width <= width + tolerance, `${label}: clips right at ${rect.x + rect.width} > ${width}`);
  assert.ok(rect.y >= -tolerance, `${label}: clips top at ${rect.y}`);
  assert.ok(rect.y + rect.height <= height + tolerance, `${label}: clips bottom at ${rect.y + rect.height} > ${height}`);
}

async function blockingA11y(page, label) {
  const a11y = await new AxeBuilder({ page }).analyze();
  const blocking = a11y.violations.filter(v => ['critical', 'serious'].includes(v.impact || ''));
  assert.deepEqual(blocking.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), [], `${label}: blocking accessibility violations`);
}

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: 'no-preference',
      isMobile: viewport.mobile,
      hasTouch: viewport.mobile,
      deviceScaleFactor: viewport.mobile ? 3 : 1,
      userAgent: viewport.mobile ? androidUserAgent : undefined,
      acceptDownloads: true
    });
    const page = await context.newPage();
    const errors = [];
    page.on('console', msg => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      const location = msg.location();
      const chromiumInvalidUrlNoise = text === 'Failed to load resource: net::ERR_INVALID_URL' && !location?.url;
      if (chromiumInvalidUrlNoise) {
        console.warn(`${viewport.name}: ignored Chromium internal ERR_INVALID_URL without source URL; request/page/HTTP failures remain blocking`);
        return;
      }
      const source = location?.url ? ` @ ${location.url}:${location.lineNumber ?? 0}:${location.columnNumber ?? 0}` : '';
      errors.push(`console: ${text}${source}`);
    });
    page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
    page.on('requestfailed', request => errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`));
    page.on('response', response => {
      if (response.url().startsWith(new URL(base).origin) && response.status() >= 400) errors.push(`http ${response.status()}: ${response.url()}`);
    });

    const response = await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 200, `${viewport.name}: page must return HTTP 200`);
    assert.match(await page.title(), /MOHAMED × A/);
    assert.equal(await page.locator('html').getAttribute('lang'), 'ar', `${viewport.name}: document language must be Arabic`);
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl', `${viewport.name}: document direction must be RTL`);
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content') || '', /noindex/i, `${viewport.name}: preview must remain noindex`);

    // Pre-entry audit: this is the exact surface that previously clipped MOHAMED on Android.
    assert.equal(await page.locator('[data-intro]').count(), 1, `${viewport.name}: cinematic intro must exist`);
    assert.equal(await page.locator('[data-intro]').getAttribute('aria-modal'), 'true', `${viewport.name}: intro must be modal`);
    await page.locator('[data-enter]').waitFor({ state: 'visible' });
    await page.waitForTimeout(120);
    const introState = await page.evaluate(() => {
      const rect = selector => {
        const r = document.querySelector(selector)?.getBoundingClientRect();
        return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null;
      };
      const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: innerWidth,
        innerHeight: innerHeight,
        panel: rect('.intro-panel'),
        title: rect('#intro-title'),
        mohamed: rect('#intro-title > span:first-child'),
        mark: rect('#intro-title > b'),
        bride: rect('#intro-title > .intro-a'),
        enter: rect('[data-enter]'),
        activeIsEnter: document.activeElement === document.querySelector('[data-enter]'),
        skipInert: document.querySelector('.skip-link')?.inert === true,
        shellInert: [...document.querySelectorAll('[data-shell]')].every(el => el.inert),
        duplicateIds
      };
    });
    assert.ok(introState.scrollWidth <= introState.innerWidth + 1, `${viewport.name}: intro creates horizontal overflow ${introState.scrollWidth} > ${introState.innerWidth}`);
    inside(introState.panel, viewport.width, viewport.height, `${viewport.name}: intro panel`, 2);
    inside(introState.title, viewport.width, viewport.height, `${viewport.name}: intro title`, 2);
    inside(introState.mohamed, viewport.width, viewport.height, `${viewport.name}: intro MOHAMED`, 2);
    inside(introState.mark, viewport.width, viewport.height, `${viewport.name}: intro ×`, 2);
    inside(introState.bride, viewport.width, viewport.height, `${viewport.name}: intro A`, 2);
    inside(introState.enter, viewport.width, viewport.height, `${viewport.name}: enter button`, 2);
    assert.ok(introState.enter.height >= 44, `${viewport.name}: enter button must be at least 44px high`);
    assert.equal(introState.activeIsEnter, true, `${viewport.name}: keyboard focus must start on enter button`);
    assert.equal(introState.skipInert, true, `${viewport.name}: skip link must not escape the modal focus scope`);
    assert.equal(introState.shellInert, true, `${viewport.name}: background shell must be inert during intro`);
    assert.deepEqual(introState.duplicateIds, [], `${viewport.name}: duplicate IDs are forbidden`);
    await blockingA11y(page, `${viewport.name} intro`);
    await page.screenshot({ path: `artifacts/mohamed-a-qa/intro-${viewport.name}.png`, fullPage: true });

    await page.locator('[data-enter]').click();
    await page.waitForTimeout(750);
    assert.equal(await page.locator('[data-intro]').count(), 0, `${viewport.name}: intro must be removed after entry`);
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'top', `${viewport.name}: focus must move to the main experience after entry`);

    await page.locator('#hero-title').waitFor({ state: 'visible' });
    const bodyText = await page.locator('body').innerText();
    assert.equal(bodyText.includes('MOHAMED'), true);
    assert.equal(bodyText.includes('03 / 09 / 2026'), true);
    assert.equal(bodyText.includes('04 / 09 / 2026'), true);
    assert.equal(bodyText.includes('قاعة شهرزاد'), true);
    assert.equal(bodyText.includes('سيتم إضافته قريبًا'), true);
    assert.equal(/RSVP|تأكيد الحضور|اعتذار/i.test(bodyText), false, `${viewport.name}: attendance response flow must remain absent`);
    assert.equal(await page.locator('form,input,textarea,select').count(), 0, `${viewport.name}: invitation must collect no guest data`);
    assert.equal(await page.locator('[data-pyro-zone]').count(), 1, `${viewport.name}: pyro drop must exist`);
    assert.equal(await page.locator('[data-finale-zone]').count(), 1, `${viewport.name}: cinematic finale must exist`);
    assert.equal(await page.locator('.impact-strip').count(), 1, `${viewport.name}: event bridge must exist`);

    const layout = await page.evaluate(() => {
      const rect = selector => document.querySelector(selector)?.getBoundingClientRect();
      const name = rect('.name-m');
      const henna = rect('.event-henna');
      const wedding = rect('.event-wedding');
      const hero = rect('.hero');
      const finale = rect('.finale');
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        inert: document.querySelectorAll('[inert]').length,
        nameLeft: name?.left ?? 0,
        nameRight: name?.right ?? 0,
        hennaTop: henna?.top ?? 0,
        weddingTop: wedding?.top ?? 0,
        hennaWidth: henna?.width ?? 0,
        weddingWidth: wedding?.width ?? 0,
        heroHeight: hero?.height ?? 0,
        finaleHeight: finale?.height ?? 0,
        externalResources: performance.getEntriesByType('resource')
          .map(entry => entry.name)
          .filter(url => new URL(url).origin !== location.origin)
      };
    });
    assert.ok(layout.scrollWidth <= layout.innerWidth + 1, `${viewport.name}: horizontal overflow ${layout.scrollWidth} > ${layout.innerWidth}`);
    assert.ok(layout.nameLeft >= -1, `${viewport.name}: hero MOHAMED clips left at ${layout.nameLeft}`);
    assert.ok(layout.nameRight <= layout.innerWidth + 1, `${viewport.name}: hero MOHAMED clips right at ${layout.nameRight}`);
    assert.equal(layout.inert, 0, `${viewport.name}: shell must be interactive after entry`);
    assert.deepEqual(layout.externalResources, [], `${viewport.name}: critical experience must have zero external resources`);
    assert.ok(layout.heroHeight <= viewport.height * 1.2, `${viewport.name}: hero must remain tightly composed`);
    if (viewport.width >= 980) {
      assert.ok(Math.abs(layout.hennaTop - layout.weddingTop) <= 3, `${viewport.name}: event cards must form one desktop spread`);
      assert.ok(layout.hennaWidth > 350 && layout.weddingWidth > 350, `${viewport.name}: desktop event cards must retain useful width`);
      assert.ok(layout.finaleHeight <= viewport.height * 1.25, `${viewport.name}: finale must not create dead vertical space`);
    }

    const mapLink = page.locator('.event-wedding .primary-button');
    const mapHref = await mapLink.getAttribute('href');
    assert.match(mapHref || '', /29\.4246933,30\.8712702/);
    assert.equal(await mapLink.getAttribute('target'), '_blank');
    assert.match(await mapLink.getAttribute('rel') || '', /noopener/);
    assert.match(await mapLink.getAttribute('rel') || '', /noreferrer/);
    assert.equal(await page.locator('[data-countdown]').getAttribute('data-date'), '2026-09-04T00:00:00+03:00');

    const ctas = page.locator('.hero-cta,.primary-button,.ghost-button,.share-button,.hero-share,.sound-button');
    for (let i = 0; i < await ctas.count(); i++) {
      const box = await ctas.nth(i).boundingBox();
      if (box && viewport.mobile) {
        assert.ok(box.height >= 44, `${viewport.name}: interaction ${i} height ${box.height} must be touch-friendly`);
        assert.ok(box.width >= 44, `${viewport.name}: interaction ${i} width ${box.width} must be touch-friendly`);
      }
    }

    // Scroll to every major composition and assert no visible headline is clipped by the viewport.
    const major = [
      ['#hero-title', 'hero title'],
      ['#countdown-title', 'countdown title'],
      ['#events-title', 'events title'],
      ['.event-henna h3', 'henna title'],
      ['.event-wedding h3', 'wedding title'],
      ['#manifesto-title', 'festival title'],
      ['#finale-title', 'finale date']
    ];
    for (const [selector, label] of major) {
      const node = page.locator(selector);
      await node.scrollIntoViewIfNeeded();
      await page.waitForTimeout(80);
      const box = await node.boundingBox();
      assert.ok(box, `${viewport.name}: ${label} must have a box`);
      assert.ok(box.x >= -2, `${viewport.name}: ${label} clips left at ${box.x}`);
      assert.ok(box.x + box.width <= viewport.width + 2, `${viewport.name}: ${label} clips right at ${box.x + box.width}`);
    }

    await blockingA11y(page, `${viewport.name} experience`);
    assert.deepEqual(errors, [], `${viewport.name}: browser/network errors detected`);

    await page.locator('[data-pyro-zone]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(260);
    assert.equal(await page.locator('[data-pyro-zone]').evaluate(el => el.classList.contains('is-live')), true, `${viewport.name}: pyro choreography must trigger`);
    await page.locator('[data-finale-zone]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(260);
    assert.equal(await page.locator('[data-finale-zone]').evaluate(el => el.classList.contains('is-live')), true, `${viewport.name}: finale choreography must trigger`);

    if (viewport.name === 'mobile-390') {
      const sound = page.locator('[data-beat-toggle]');
      await sound.click();
      assert.equal(await sound.getAttribute('aria-pressed'), 'true', 'mobile-390: beat must turn on only after user action');
      await sound.click();
      assert.equal(await sound.getAttribute('aria-pressed'), 'false', 'mobile-390: beat must turn off cleanly');
    }

    const reveals = page.locator('.reveal');
    for (let i = 0; i < await reveals.count(); i++) {
      await reveals.nth(i).scrollIntoViewIfNeeded();
      await page.waitForTimeout(45);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(160);
    await page.screenshot({ path: `artifacts/mohamed-a-qa/${viewport.name}.png`, fullPage: true });
    await context.close();
  }

  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true, deviceScaleFactor: 3, userAgent: androidUserAgent });
  const page = await reduced.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('[data-enter]').click();
  const reducedState = await page.evaluate(() => ({
    sparks: getComputedStyle(document.querySelector('#sparks')).display,
    ring: getComputedStyle(document.querySelector('.hero-ring')).display,
    dropLines: getComputedStyle(document.querySelector('.drop-lines')).display,
    finaleStage: getComputedStyle(document.querySelector('.finale-stage')).display
  }));
  assert.equal(reducedState.sparks, 'none');
  assert.equal(reducedState.ring, 'none');
  assert.equal(reducedState.dropLines, 'none');
  assert.equal(reducedState.finaleStage, 'none');
  await reduced.close();
} finally {
  await browser.close();
}

console.log('MOHAMED × A full-project 100/100 QA passed, including Android intro bounds');
