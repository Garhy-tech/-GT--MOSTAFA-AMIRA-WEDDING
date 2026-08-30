import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.MOHAMED_A_QA_URL || 'http://127.0.0.1:4173/projects/mohamed-a-2026/index.html';
const sizes = [
  ['mobile-280',280,653,true],['mobile-320',320,700,true],['mobile-360',360,800,true],
  ['mobile-390',390,844,true],['mobile-412',412,915,true],['mobile-430',430,932,true],
  ['tablet-768',768,1024,false],['desktop-1024',1024,768,false],['desktop-1440',1440,900,false]
];
const browser = await chromium.launch({headless:true});

try{
  for(const [name,width,height,mobile] of sizes){
    const context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?3:1});
    const page=await context.newPage();
    await page.goto(base,{waitUntil:'networkidle'});
    await page.locator('[data-enter]').waitFor({state:'visible'});
    const state=await page.evaluate(()=>{
      const get=selector=>{const r=document.querySelector(selector)?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null};
      return {panel:get('.intro-panel'),title:get('#intro-title'),mohamed:get('#intro-title>span:first-child'),mark:get('#intro-title>b'),bride:get('#intro-title>.intro-a')};
    });
    assert.ok(state.panel,`${name}: intro panel missing`);
    for(const [label,rect] of [['title',state.title],['MOHAMED',state.mohamed],['×',state.mark],['A',state.bride]]){
      assert.ok(rect,`${name}: ${label} missing`);
      assert.ok(rect.left>=state.panel.left-2,`${name}: ${label} clips through card left edge (${rect.left} < ${state.panel.left})`);
      assert.ok(rect.right<=state.panel.right+2,`${name}: ${label} clips through card right edge (${rect.right} > ${state.panel.right})`);
      assert.ok(rect.top>=state.panel.top-2,`${name}: ${label} clips through card top edge`);
      assert.ok(rect.bottom<=state.panel.bottom+2,`${name}: ${label} clips through card bottom edge`);
    }
    await context.close();
  }
}finally{await browser.close()}
console.log('MOHAMED × A intro typography stays inside the card on every supported viewport');
