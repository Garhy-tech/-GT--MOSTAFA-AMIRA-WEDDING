import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base=process.env.MOHAMED_A_QA_URL||'http://127.0.0.1:4173/projects/mohamed-a-2026/index.html';
const modes=[['mobile-390',390,844,true],['desktop-1440',1440,900,false]];
const frames=[
  ['hero','.hero',220],
  ['countdown','.countdown',260],
  ['henna','.event-henna',760],
  ['wedding','.event-wedding',760],
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
    for(const [name,selector,delay] of frames){
      const node=page.locator(selector);
      await node.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest'}));
      await page.waitForTimeout(delay);
      const box=await node.boundingBox();
      assert.ok(box,`${mode}/${name}: target must render`);
      assert.ok(box.x<width&&box.x+box.width>0,`${mode}/${name}: target must intersect viewport horizontally`);
      assert.ok(box.y<height&&box.y+box.height>0,`${mode}/${name}: target must intersect viewport vertically`);
      if(await node.evaluate(el=>el.classList.contains('reveal'))){
        assert.equal(await node.evaluate(el=>el.classList.contains('visible')),true,`${mode}/${name}: reveal target must be fully activated before capture`);
        const opacity=Number(await node.evaluate(el=>getComputedStyle(el).opacity));
        assert.ok(opacity>=0.99,`${mode}/${name}: opacity ${opacity} must be fully visible`);
      }
      const text=(await node.innerText()).trim();
      assert.ok(text.length>0,`${mode}/${name}: target must contain visible content`);
      await page.screenshot({path:`artifacts/mohamed-a-qa/frame-${mode}-${name}.png`,fullPage:false});
    }
    assert.deepEqual(errors,[],`${mode}: browser errors detected during visual-frame audit`);
    await context.close();
  }
}finally{await browser.close()}
console.log('MOHAMED × A real viewport visual frames captured and validated, including both event cards');
