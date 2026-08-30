(()=>{
const legacy=document.querySelector('[data-beat-toggle]');
const state=window.__garhyAudio;
if(!legacy||!state?.music)return;
const button=legacy.cloneNode(true);
legacy.replaceWith(button);
button.dataset.musicToggle='';
const label=button.querySelector('[data-sound-label]');
const audio=state.music;
const style=document.createElement('style');
style.textContent=`.sound-button[data-music-toggle]{--music-progress:0;position:relative;overflow:hidden;border-color:rgba(225,180,83,.28);background:linear-gradient(135deg,rgba(239,38,59,.12),rgba(255,106,0,.055),rgba(255,255,255,.025));box-shadow:inset 0 0 22px rgba(255,106,0,.025),0 10px 28px rgba(0,0,0,.16);transition:border-color .2s ease,background .2s ease,transform .2s ease}.sound-button[data-music-toggle]::after{content:"";position:absolute;inset:auto 0 0;height:2px;background:linear-gradient(90deg,#ef263b,#ff6a00,#e1b453);transform:scaleX(var(--music-progress));transform-origin:left;transition:transform .2s linear;box-shadow:0 0 12px rgba(255,106,0,.45)}.sound-button[data-music-toggle]:hover{border-color:rgba(225,180,83,.5);transform:translateY(-1px)}.sound-button[data-music-toggle][aria-pressed="true"]{border-color:rgba(239,38,59,.5);background:linear-gradient(135deg,rgba(239,38,59,.2),rgba(255,106,0,.08))}.sound-button[data-music-toggle][aria-pressed="true"] .sound-bars i{animation:garhyMusicBar .72s ease-in-out infinite alternate}.sound-button[data-music-toggle][aria-pressed="true"] .sound-bars i:nth-child(2){animation-delay:.13s}.sound-button[data-music-toggle][aria-pressed="true"] .sound-bars i:nth-child(3){animation-delay:.26s}@keyframes garhyMusicBar{from{transform:scaleY(.45);opacity:.62}to{transform:scaleY(1.25);opacity:1}}@media(prefers-reduced-motion:reduce){.sound-button[data-music-toggle],.sound-button[data-music-toggle] .sound-bars i{transition:none!important;animation:none!important}}`;
document.head.append(style);
function setState(playing){
 button.setAttribute('aria-pressed',String(playing));
 button.setAttribute('aria-label',playing?'إيقاف أغنية الفرح':'تشغيل أغنية الفرح');
 if(label)label.textContent=playing?'MUSIC ON':'MUSIC';
}
setState(!audio.paused&&state.started);
button.addEventListener('click',async()=>{
 if(!audio.paused){audio.pause();setState(false);return}
 try{state.started=true;await audio.play();setState(true)}
 catch(error){state.started=false;console.error('GARHY_MUSIC_PLAYBACK_FAILED',error);setState(false);if(label){label.textContent='RETRY';setTimeout(()=>{if(audio.paused)label.textContent='MUSIC'},1500)}}
});
audio.addEventListener('play',()=>{state.started=true;setState(true)});
audio.addEventListener('pause',()=>setState(false));
audio.addEventListener('timeupdate',()=>{const value=audio.duration?Math.min(1,audio.currentTime/audio.duration):0;button.style.setProperty('--music-progress',value.toFixed(4))});
audio.addEventListener('ended',()=>{audio.currentTime=0;button.style.setProperty('--music-progress','0');setState(false)});
audio.addEventListener('error',()=>{setState(false);if(label)label.textContent='RETRY'});
let adObjectUrl='';
addEventListener('pagehide',()=>{audio.pause();if(adObjectUrl){URL.revokeObjectURL(adObjectUrl);adObjectUrl=''}},{once:true});

const footer=document.querySelector('footer[data-shell]');
if(footer&&!document.querySelector('[data-gt-ads]')){
 const section=document.createElement('section');
 section.className='gt-ad-showcase section';
 section.dataset.gtAds='';
 section.setAttribute('aria-labelledby','gt-ads-title');
 section.innerHTML=`<div class="gt-ad-head"><div><p class="eyebrow">GARHY TECH / SPONSORED SHOWCASE</p><h2 id="gt-ads-title">تقنية تلمس كل لحظة</h2></div><p>متجر رقمي، أدوات مطورين، أتمتة ذكية، دعم وشحن — في شريط بصري واحد.</p></div><div class="gt-ad-marquee" aria-label="إعلانات GARHY TECH المتحركة"><div class="gt-ad-track"><img data-gt-ad-image alt="مجموعة إعلانات GARHY TECH" width="2236" height="98" loading="lazy" decoding="async" fetchpriority="low"><img data-gt-ad-image aria-hidden="true" alt="" width="2236" height="98" loading="lazy" decoding="async" fetchpriority="low"></div></div><p class="gt-ad-note">GARHY TECH • DIGITAL STORE • AUTOMATION • DEVELOPER TOOLS • SUPPORT • DELIVERY</p>`;
 footer.before(section);
 const images=[...section.querySelectorAll('[data-gt-ad-image]')];
 const parts=['./media/ads/gt-ad-strip.b64'];
 let loaded=false;
 function webpBlobUrl(encoded){
   const binary=atob(encoded);
   const bytes=new Uint8Array(binary.length);
   for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
   return URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
 }
 async function loadAds(){
   if(loaded)return;loaded=true;
   try{
     const chunks=await Promise.all(parts.map(async src=>{const response=await fetch(src,{cache:'force-cache'});if(!response.ok)throw new Error(`Ad asset ${response.status}`);return response.text()}));
     const encoded=chunks.join('').replace(/\s+/g,'');
     if(!encoded)throw new Error('Ad asset empty');
     if(adObjectUrl)URL.revokeObjectURL(adObjectUrl);
     adObjectUrl=webpBlobUrl(encoded);
     images.forEach(img=>img.src=adObjectUrl);
     section.dataset.adsReady='true';
   }catch(error){loaded=false;section.dataset.adsReady='error';console.warn('GARHY_AD_STRIP_FAILED',error)}
 }
 if(!('IntersectionObserver'in window))void loadAds();
 else{
   const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();void loadAds()}},{rootMargin:'700px 0px',threshold:.01});
   observer.observe(section);
 }
}
})();