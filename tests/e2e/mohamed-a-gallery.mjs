import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base=process.env.MOHAMED_A_QA_URL||'http://127.0.0.1:4173/projects/mohamed-a-2026/index.html';
const modes=[['mobile-390',390,844,true],['desktop-1440',1440,900,false]];
await fs.mkdir('artifacts/mohamed-a-qa',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
  for(const [name,width,height,mobile] of modes){
    const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?3:1});
    const page=await context.newPage();
    const remote=[];const failures=[];
    page.on('request',request=>{const url=request.url();if(url.startsWith('https://images.unsplash.com/'))remote.push(url)});
    page.on('requestfailed',request=>failures.push(`${request.url()} ${request.failure()?.errorText||''}`));
    page.on('response',response=>{if(response.url().startsWith('https://images.unsplash.com/')&&response.status()>=400)failures.push(`${response.status()} ${response.url()}`)});
    const response=await page.goto(base,{waitUntil:'networkidle'});
    assert.equal(response?.status(),200,`${name}: page must load`);
    assert.equal(remote.length,0,`${name}: gallery media must not load on the intro critical path`);
    await page.locator('[data-enter]').click();
    await page.waitForTimeout(800);
    assert.equal(remote.length,0,`${name}: gallery media must remain deferred immediately after entry`);
    assert.equal(await page.locator('[data-festival-image]').count(),3,`${name}: exactly three curated 2026 images required`);
    const declared=await page.locator('[data-festival-image]').evaluateAll(images=>images.map(img=>({src:img.getAttribute('src'),dataSrc:img.getAttribute('data-src'),loading:img.getAttribute('loading'),decoding:img.getAttribute('decoding'),priority:img.getAttribute('fetchpriority'),width:img.getAttribute('width'),height:img.getAttribute('height')})));
    for(const image of declared){
      assert.match(image.src||'',/^data:image\/gif;base64,/,`${name}: image must start from an inline placeholder`);
      assert.match(image.dataSrc||'',/^https:\/\/images\.unsplash\.com\//,`${name}: image host must be restricted to Unsplash CDN`);
      assert.match(image.dataSrc||'',/[?&]fm=webp(?:&|$)/,`${name}: gallery image must request WebP`);
      assert.equal(image.loading,'lazy',`${name}: native lazy hint required`);
      assert.equal(image.decoding,'async',`${name}: async decoding required`);
      assert.equal(image.priority,'low',`${name}: low fetch priority required`);
      assert.ok(Number(image.width)>0&&Number(image.height)>0,`${name}: intrinsic dimensions required to prevent CLS`);
    }
    await page.locator('[data-gallery-zone]').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>[...document.querySelectorAll('[data-festival-image]')].every(img=>img.dataset.mediaState==='loaded'&&img.naturalWidth>1),null,{timeout:20000});
    assert.equal(new Set(remote).size,3,`${name}: exactly three remote gallery image requests expected after approach`);
    assert.deepEqual(failures,[],`${name}: gallery requests must complete without network errors`);
    const state=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth,loaded:document.querySelectorAll('.media-card.is-loaded').length,failed:document.querySelectorAll('.gallery-load-failed').length,boxes:[...document.querySelectorAll('.media-card')].map(el=>{const r=el.getBoundingClientRect();return{x:r.x,width:r.width}})}));
    assert.ok(state.scrollWidth<=state.innerWidth+1,`${name}: gallery must not create horizontal overflow`);
    assert.equal(state.loaded,3,`${name}: all three gallery cards must enter loaded state`);
    assert.equal(state.failed,0,`${name}: no visual fallback should be needed`);
    for(const box of state.boxes){assert.ok(box.x>=-2&&box.x+box.width<=width+2,`${name}: gallery card clips outside viewport`)}
    await page.screenshot({path:`artifacts/mohamed-a-qa/gallery-${name}.png`,fullPage:false});
    await context.close();
  }
}finally{await browser.close()}
console.log('MOHAMED × A lazy 2026 gallery QA passed on mobile and desktop');
