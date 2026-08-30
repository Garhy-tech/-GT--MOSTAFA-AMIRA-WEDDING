(()=>{
const intro=document.querySelector('[data-intro]');
const enter=document.querySelector('[data-enter]');
const skip=document.querySelector('.skip-link');
const template=document.querySelector('[data-experience-template]');
if(!intro||!enter||!template)return;
skip?.setAttribute('inert','');
if(matchMedia('(max-width:640px)').matches)document.querySelectorAll('.intro-burst').forEach(node=>node.remove());
enter.focus({preventScroll:true});

const MUSIC_SRC='./media/jamaican-bam-bam.ogg';
const CHIME_SRC='./media/cha-ching.ogg';
const music=new Audio();
music.preload='none';
music.src=MUSIC_SRC;
music.volume=.56;
music.loop=true;
const audioState={
  music,
  started:false,
  fxCount:0,
  async startMusic(){
    if(!music.paused)return true;
    try{
      await music.play();
      this.started=true;
      return true;
    }catch(error){
      this.started=false;
      console.warn('GARHY_MUSIC_FIRST_GESTURE_BLOCKED',error);
      return false;
    }
  },
  feedback(){
    this.fxCount+=1;
    try{if(typeof navigator.vibrate==='function')navigator.vibrate(18)}catch{}
    try{
      const fx=new Audio();
      fx.preload='auto';
      fx.src=CHIME_SRC;
      fx.volume=.62;
      fx.play().catch(()=>{});
    }catch{}
  }
};
window.__garhyAudio=audioState;
document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target.closest('button,a[href]'):null;
  if(!target||target.hasAttribute('disabled')||target.getAttribute('aria-disabled')==='true')return;
  audioState.feedback();
  if(!audioState.started)void audioState.startMusic();
},{capture:true});

const note=document.querySelector('.intro-note');
if(note)note.textContent='الموسيقى تبدأ مع أول ضغطة ويمكن إيقافها من زر MUSIC';

let starting=false;
const originalLabel=enter.querySelector('span')?.textContent||'ادخل الليلة';
function loadStyle(href){return new Promise((resolve,reject)=>{const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.onload=()=>resolve(link);link.onerror=()=>reject(new Error(`تعذر تحميل ${href}`));document.head.append(link)})}
function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.async=false;script.onload=()=>resolve(script);script.onerror=()=>reject(new Error(`تعذر تحميل ${src}`));document.head.append(script)})}
async function start(){
 if(starting)return;starting=true;
 enter.disabled=true;enter.setAttribute('aria-busy','true');intro.classList.add('is-entering');
 const label=enter.querySelector('span');if(label)label.textContent='يلا بينا';
 try{
   document.body.setAttribute('data-experience-booted','');
   const fragment=template.content.cloneNode(true);template.before(fragment);template.remove();
   const grain=document.querySelector('.grain');
   if(grain){grain.style.backgroundImage='radial-gradient(circle at 20% 30%,rgba(255,255,255,.18) 0 1px,transparent 1.4px),radial-gradient(circle at 75% 65%,rgba(255,255,255,.12) 0 1px,transparent 1.5px)';grain.style.backgroundSize='17px 17px,23px 23px';grain.style.backgroundPosition='0 0,7px 9px'}
   const sound=document.querySelector('[data-beat-toggle]');if(sound){sound.setAttribute('aria-label','إيقاف أو تشغيل أغنية الفرح');const soundLabel=sound.querySelector('[data-sound-label]');if(soundLabel)soundLabel.textContent='MUSIC'}
   await Promise.all([
     loadStyle('./styles.css'),loadStyle('./responsive.css'),loadStyle('./polish.css'),
     loadScript('./app.js'),loadScript('./polish.js'),loadScript('./music.js')
   ]);
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   document.body.classList.remove('intro-active');
   skip?.removeAttribute('inert');
   intro.classList.add('is-leaving');
   const top=document.querySelector('#top');if(top){top.tabIndex=-1;top.focus({preventScroll:true})}
   document.dispatchEvent(new Event('garhy:experience-entered'));
   setTimeout(()=>intro.remove(),matchMedia('(prefers-reduced-motion: reduce)').matches?0:360);
 }catch(error){
   console.error(error);starting=false;enter.disabled=false;enter.removeAttribute('aria-busy');intro.classList.remove('is-entering');if(label)label.textContent='حاول مرة أخرى';document.body.removeAttribute('data-experience-booted');
   setTimeout(()=>{if(label&&!starting)label.textContent=originalLabel},1800);
 }
}
enter.addEventListener('click',start);
intro.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target===intro)start()});
})();