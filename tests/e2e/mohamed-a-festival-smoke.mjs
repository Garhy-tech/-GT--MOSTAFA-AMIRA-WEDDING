import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.env.MOHAMED_A_QA_URL || 'http://127.0.0.1:4173/projects/mohamed-a-2026/index.html';
const viewports = [
  { name: 'mobile-320', width: 320, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

await fs.mkdir('artifacts/mohamed-a-qa', { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });
    page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));

    const response = await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 200, `${viewport.name}: page must return HTTP 200`);
    assert.match(await page.title(), /MOHAMED × A/);
    assert.equal(await page.locator('[data-intro]').count(), 1, `${viewport.name}: cinematic intro must exist`);
    await page.locator('[data-enter]').click();
    await page.waitForTimeout(750);

    await page.locator('#hero-title').waitFor({ state: 'visible' });
    assert.equal((await page.locator('body').innerText()).includes('MOHAMED'), true);
    assert.equal((await page.locator('body').innerText()).includes('03 / 09 / 2026'), true);
    assert.equal((await page.locator('body').innerText()).includes('04 / 09 / 2026'), true);
    assert.equal((await page.locator('body').innerText()).includes('قاعة شهرزاد'), true);
    assert.equal((await page.locator('body').innerText()).includes('سيتم إضافته قريبًا'), true);

    const forbidden = await page.locator('body').innerText();
    assert.equal(/RSVP|تأكيد الحضور|اعتذار/i.test(forbidden), false, `${viewport.name}: attendance response flow must remain absent`);

    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      inert: document.querySelectorAll('[inert]').length,
      externalResources: performance.getEntriesByType('resource')
        .map(entry => entry.name)
        .filter(url => new URL(url).origin !== location.origin)
    }));
    assert.ok(layout.scrollWidth <= layout.innerWidth + 1, `${viewport.name}: horizontal overflow ${layout.scrollWidth} > ${layout.innerWidth}`);
    assert.equal(layout.inert, 0, `${viewport.name}: shell must be interactive after entry`);
    assert.deepEqual(layout.externalResources, [], `${viewport.name}: critical experience must have zero external resources`);

    const mapHref = await page.locator('.event-wedding .primary-button').getAttribute('href');
    assert.match(mapHref || '', /29\.4246933,30\.8712702/);

    const a11y = await new AxeBuilder({ page }).analyze();
    const blocking = a11y.violations.filter(v => ['critical', 'serious'].includes(v.impact || ''));
    assert.deepEqual(blocking.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), [], `${viewport.name}: blocking accessibility violations`);
    assert.deepEqual(errors, [], `${viewport.name}: browser errors detected`);

    await page.screenshot({ path: `artifacts/mohamed-a-qa/${viewport.name}.png`, fullPage: true });
    await context.close();
  }

  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await reduced.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('[data-enter]').click();
  const reducedState = await page.evaluate(() => ({ sparks: getComputedStyle(document.querySelector('#sparks')).display, ring: getComputedStyle(document.querySelector('.hero-ring')).display }));
  assert.equal(reducedState.sparks, 'none');
  assert.equal(reducedState.ring, 'none');
  await reduced.close();
} finally {
  await browser.close();
}

console.log('MOHAMED × A multi-viewport browser QA passed');
