import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base=process.env.MOHAMED_A_QA_URL||'http://127.0.0.1:4173/projects/mohamed-a-2026/index.html';
const modes=[['mobile-390',390,844,true],['desktop-1440',1440,900,false]];
const frames=[
  ['hero','.hero',100],
  ['countdown','.countdown',100],
  ['henna','.event-henna',100],
  ['wedding','.event-wedding',100],
  ['festival','[data-pyro-zone]',700],
  ['finale','[data-finale-zone]',700]
];
await fs.mkdir('artifacts/mohamed-a-qa',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
  for(const [mode,width,height,mobile] of modes){
    const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?3:1});
    const page=await context.newPage();
    const errors=[];
    page.on('console',msg=>{if(msg.type()==='error')errors.push(`console: ${msg.text()}`)});
    page.on('pageerror',err=>errors.push(`pageerror: ${err.message}`));
    await page.goto(base,{waitUntil:'networkidle'});
    await page.locator('[data-enter]').click();
    await page.waitForTimeout(750);
    const skip=await page.locator('.skip-link').boundingBox();
    assert.ok(skip&&skip.y+skip.height<=1,`${mode}: skip link must stay visually hidden after entry`);
    for(const [name,selector,effectDelay] of frames){
      const node=page.locator(selector);
      await node.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest'}));
      const isReveal=await node.evaluate(el=>el.classList.contains('reveal'));
      if(isReveal){
        await page.waitForFunction(
          target=>{
            const el=document.querySelector(target);
            return Boolean(el&&el.classList.contains('visible')&&Number.parseFloat(getComputedStyle(el).opacity)>=.99);
          },
          selector,
          {timeout:2200}
        );
        assert.equal(await node.evaluate(el=>el.classList.contains('visible')),true,`${mode}/${name}: reveal target must be fully activated before capture`);
        const opacity=Number(await node.evaluate(el=>getComputedStyle(el).opacity));
        assert.ok(opacity>=.99,`${mode}/${name}: opacity ${opacity} must be fully visible`);
      }
      await page.waitForTimeout(effectDelay);
      const box=await node.boundingBox();
      assert.ok(box,`${mode}/${name}: target must render`);
      assert.ok(box.x<width&&box.x+box.width>0,`${mode}/${name}: target must intersect viewport horizontally`);
      assert.ok(box.y<height&&box.y+box.height>0,`${mode}/${name}: target must intersect viewport vertically`);
      const text=(await node.innerText()).trim();
      assert.ok(text.length>0,`${mode}/${name}: target must contain visible content`);
      await page.screenshot({path:`artifacts/mohamed-a-qa/frame-${mode}-${name}.png`,fullPage:false});
    }
    assert.deepEqual(errors,[],`${mode}: browser errors detected during visual-frame audit`);
    await context.close();
  }
}finally{await browser.close()}
console.log('MOHAMED × A visual frames validated after real reveal transitions settle');
