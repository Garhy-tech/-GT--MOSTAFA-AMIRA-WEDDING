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
    const bodyText = await page.locator('body').innerText();
    assert.equal(bodyText.includes('MOHAMED'), true);
    assert.equal(bodyText.includes('03 / 09 / 2026'), true);
    assert.equal(bodyText.includes('04 / 09 / 2026'), true);
    assert.equal(bodyText.includes('قاعة شهرزاد'), true);
    assert.equal(bodyText.includes('سيتم إضافته قريبًا'), true);
    assert.equal(/RSVP|تأكيد الحضور|اعتذار/i.test(bodyText), false, `${viewport.name}: attendance response flow must remain absent`);
    assert.equal(await page.locator('[data-pyro-zone]').count(), 1, `${viewport.name}: pyro drop must exist`);
    assert.equal(await page.locator('[data-finale-zone]').count(), 1, `${viewport.name}: cinematic finale must exist`);
    assert.equal(await page.locator('.impact-strip').count(), 1, `${viewport.name}: event bridge must exist`);

    const layout = await page.evaluate(() => {
      const name = document.querySelector('.name-m')?.getBoundingClientRect();
      const henna = document.querySelector('.event-henna')?.getBoundingClientRect();
      const wedding = document.querySelector('.event-wedding')?.getBoundingClientRect();
      const hero = document.querySelector('.hero')?.getBoundingClientRect();
      const finale = document.querySelector('.finale')?.getBoundingClientRect();
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
    assert.ok(layout.nameLeft >= -1, `${viewport.name}: MOHAMED clips left at ${layout.nameLeft}`);
    assert.ok(layout.nameRight <= layout.innerWidth + 1, `${viewport.name}: MOHAMED clips right at ${layout.nameRight}`);
    assert.equal(layout.inert, 0, `${viewport.name}: shell must be interactive after entry`);
    assert.deepEqual(layout.externalResources, [], `${viewport.name}: critical experience must have zero external resources`);
    assert.ok(layout.heroHeight <= viewport.height * 1.2, `${viewport.name}: hero must remain tightly composed`);
    if (viewport.width >= 980) {
      assert.ok(Math.abs(layout.hennaTop - layout.weddingTop) <= 3, `${viewport.name}: event cards must form one desktop spread`);
      assert.ok(layout.hennaWidth > 350 && layout.weddingWidth > 350, `${viewport.name}: desktop event cards must retain useful width`);
      assert.ok(layout.finaleHeight <= viewport.height * 1.25, `${viewport.name}: finale must not create dead vertical space`);
    }

    const mapHref = await page.locator('.event-wedding .primary-button').getAttribute('href');
    assert.match(mapHref || '', /29\.4246933,30\.8712702/);

    const ctas = page.locator('.hero-cta,.primary-button,.ghost-button,.share-button,.hero-share,.enter-button');
    for (let i = 0; i < await ctas.count(); i++) {
      const box = await ctas.nth(i).boundingBox();
      if (box) assert.ok(box.height >= 40, `${viewport.name}: primary interaction ${i} must be touch-friendly`);
    }

    const a11y = await new AxeBuilder({ page }).analyze();
    const blocking = a11y.violations.filter(v => ['critical', 'serious'].includes(v.impact || ''));
    assert.deepEqual(blocking.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), [], `${viewport.name}: blocking accessibility violations`);
    assert.deepEqual(errors, [], `${viewport.name}: browser errors detected`);

    await page.locator('[data-pyro-zone]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(260);
    assert.equal(await page.locator('[data-pyro-zone]').evaluate(el => el.classList.contains('is-live')), true, `${viewport.name}: pyro choreography must trigger`);
    await page.locator('[data-finale-zone]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(260);
    assert.equal(await page.locator('[data-finale-zone]').evaluate(el => el.classList.contains('is-live')), true, `${viewport.name}: finale choreography must trigger`);

    const reveals = page.locator('.reveal');
    for (let i = 0; i < await reveals.count(); i++) {
      await reveals.nth(i).scrollIntoViewIfNeeded();
      await page.waitForTimeout(55);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(180);
    await page.screenshot({ path: `artifacts/mohamed-a-qa/${viewport.name}.png`, fullPage: true });
    await context.close();
  }

  const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
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

console.log('MOHAMED × A final 100/100 multi-viewport browser QA passed');
