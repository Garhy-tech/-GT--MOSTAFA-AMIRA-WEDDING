(()=>{
const legacy=document.querySelector('[data-beat-toggle]');
if(!legacy)return;
const button=legacy.cloneNode(true);
legacy.replaceWith(button);
button.dataset.musicToggle='';
button.setAttribute('aria-pressed','false');
button.setAttribute('aria-label','تشغيل أغنية الفرح');
const label=button.querySelector('[data-sound-label]');
if(label)label.textContent='MUSIC';
const style=document.createElement('style');
style.textContent=`.sound-button[data-music-toggle]{--music-progress:0;position:relative;overflow:hidden;border-color:rgba(225,180,83,.28);background:linear-gradient(135deg,rgba(239,38,59,.12),rgba(255,106,0,.055),rgba(255,255,255,.025));box-shadow:inset 0 0 22px rgba(255,106,0,.025),0 10px 28px rgba(0,0,0,.16);transition:border-color .2s ease,background .2s ease,transform .2s ease}.sound-button[data-music-toggle]::after{content:"";position:absolute;inset:auto 0 0;height:2px;background:linear-gradient(90deg,#ef263b,#ff6a00,#e1b453);transform:scaleX(var(--music-progress));transform-origin:left;transition:transform .2s linear;box-shadow:0 0 12px rgba(255,106,0,.45)}.sound-button[data-music-toggle]:hover{border-color:rgba(225,180,83,.5);transform:translateY(-1px)}.sound-button[data-music-toggle][aria-pressed="true"]{border-color:rgba(239,38,59,.5);background:linear-gradient(135deg,rgba(239,38,59,.2),rgba(255,106,0,.08))}.sound-button[data-music-toggle][aria-pressed="true"] .sound-bars i{animation:garhyMusicBar .72s ease-in-out infinite alternate}.sound-button[data-music-toggle][aria-pressed="true"] .sound-bars i:nth-child(2){animation-delay:.13s}.sound-button[data-music-toggle][aria-pressed="true"] .sound-bars i:nth-child(3){animation-delay:.26s}@keyframes garhyMusicBar{from{transform:scaleY(.45);opacity:.62}to{transform:scaleY(1.25);opacity:1}}@media(prefers-reduced-motion:reduce){.sound-button[data-music-toggle],.sound-button[data-music-toggle] .sound-bars i{transition:none!important;animation:none!important}}`;
document.head.append(style);
const audio=new Audio();
audio.preload='none';audio.volume=.78;
let sourced=false;
function setState(playing){button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',playing?'إيقاف أغنية الفرح':'تشغيل أغنية الفرح');if(label)label.textContent=playing?'MUSIC ON':'MUSIC'}
function ensureSource(){if(sourced)return;sourced=true;audio.src='./media/daweta-zewace.mp3'}
button.addEventListener('click',async()=>{if(!audio.paused){audio.pause();setState(false);return}ensureSource();try{await audio.play();setState(true)}catch(error){console.error('GARHY_MUSIC_PLAYBACK_FAILED',error);setState(false);if(label){label.textContent='RETRY';setTimeout(()=>{if(audio.paused)label.textContent='MUSIC'},1600)}}});
audio.addEventListener('timeupdate',()=>{const value=audio.duration?Math.min(1,audio.currentTime/audio.duration):0;button.style.setProperty('--music-progress',value.toFixed(4))});
audio.addEventListener('ended',()=>{audio.currentTime=0;button.style.setProperty('--music-progress','0');setState(false)});
audio.addEventListener('error',()=>{setState(false);if(label)label.textContent='RETRY'});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!audio.paused){audio.pause();setState(false)}});
addEventListener('pagehide',()=>audio.pause());
})();
