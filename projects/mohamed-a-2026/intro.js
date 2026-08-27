(()=>{
const intro=document.querySelector('[data-intro]');
const enter=document.querySelector('[data-enter]');
const skip=document.querySelector('.skip-link');
const template=document.querySelector('[data-experience-template]');
if(!intro||!enter||!template)return;
skip?.setAttribute('inert','');
requestAnimationFrame(()=>enter.focus({preventScroll:true}));
let starting=false;
const originalLabel=enter.querySelector('span')?.textContent||'ادخل الليلة';
function loadStyle(href){return new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.onload=()=>resolve(link);link.onerror=()=>reject(new Error(`تعذر تحميل ${href}`));document.head.append(link)})}
function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.defer=true;script.onload=()=>resolve(script);script.onerror=()=>reject(new Error(`تعذر تحميل ${src}`));document.head.append(script)})}
async function start(){
 if(starting)return;starting=true;enter.disabled=true;enter.setAttribute('aria-busy','true');const label=enter.querySelector('span');if(label)label.textContent='جارٍ تجهيز الليلة';
 try{
   document.body.setAttribute('data-experience-booted','');
   const fragment=template.content.cloneNode(true);template.before(fragment);template.remove();
   await Promise.all([loadStyle('./styles.css'),loadStyle('./responsive.css'),loadStyle('./polish.css')]);
   await loadScript('./app.js');
   await loadScript('./polish.js');
   document.body.classList.remove('intro-active');
   skip?.removeAttribute('inert');
   intro.classList.add('is-leaving');
   const top=document.querySelector('#top');if(top){top.tabIndex=-1;top.focus({preventScroll:true})}
   setTimeout(()=>intro.remove(),matchMedia('(prefers-reduced-motion: reduce)').matches?0:620);
 }catch(error){
   console.error(error);starting=false;enter.disabled=false;enter.removeAttribute('aria-busy');if(label)label.textContent='حاول مرة أخرى';document.body.removeAttribute('data-experience-booted');
   setTimeout(()=>{if(label&&!starting)label.textContent=originalLabel},1800);
 }
}
enter.addEventListener('click',start);
intro.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target===intro)start()});
})();
