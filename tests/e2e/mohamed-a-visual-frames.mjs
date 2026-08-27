import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base=process.env.MOHAMED_A_QA_URL||'http://127.0.0.1:4173/projects/mohamed-a-2026/index.html';
const modes=[['mobile-390',390,844,true],['desktop-1440',1440,900,false]];
const frames=[['hero','.hero'],['countdown','.countdown'],['events','.events'],['festival','[data-pyro-zone]'],['finale','[data-finale-zone]']];
await fs.mkdir('artifacts/mohamed-a-qa',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
  for(const [mode,width,height,mobile] of modes){
    const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?3:1});
    const page=await context.newPage();
    await page.goto(base,{waitUntil:'networkidle'});
    await page.locator('[data-enter]').click();
    await page.waitForTimeout(750);
    const skip=await page.locator('.skip-link').boundingBox();
    assert.ok(skip&&skip.y+skip.height<=1,`${mode}: skip link must stay visually hidden after entry`);
    for(const [name,selector] of frames){
      const node=page.locator(selector);
      await node.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest'}));
      await page.waitForTimeout(name==='festival'||name==='finale'?600:220);
      const box=await node.boundingBox();
      assert.ok(box,`${mode}/${name}: section must render`);
      assert.ok(box.x<width&&box.x+box.width>0,`${mode}/${name}: section must intersect viewport horizontally`);
      assert.ok(box.y<height&&box.y+box.height>0,`${mode}/${name}: section must intersect viewport vertically`);
      await page.screenshot({path:`artifacts/mohamed-a-qa/frame-${mode}-${name}.png`,fullPage:false});
    }
    await context.close();
  }
}finally{await browser.close()}
console.log('MOHAMED × A real viewport visual frames captured and validated');
