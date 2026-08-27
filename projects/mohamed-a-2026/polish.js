(()=>{
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const progress=document.querySelector('[data-scroll-progress]');let scheduled=false;
function paintProgress(){scheduled=false;if(!progress)return;const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);const ratio=Math.min(1,Math.max(0,scrollY/max));progress.style.transform=`scaleX(${ratio.toFixed(4)})`}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(paintProgress)}},{passive:true});paintProgress();

let galleryStylesReady=false;
function loadGalleryStyles(){if(galleryStylesReady)return;galleryStylesReady=true;const link=document.createElement('link');link.rel='stylesheet';link.href='./gallery.css';link.dataset.galleryStyles='';document.head.append(link)}
document.querySelector('[data-enter]')?.addEventListener('click',loadGalleryStyles,{once:true});

const galleryImages=[...document.querySelectorAll('[data-festival-image]')];
function markImageReady(img){const card=img.closest('.media-card');if(!card)return;card.classList.add('is-loaded');card.classList.remove('is-loading')}
function markImageFailed(img){const card=img.closest('.media-card');if(!card)return;img.style.display='none';card.classList.remove('is-loading');if(!card.querySelector('.gallery-load-failed')){const note=document.createElement('span');note.className='gallery-load-failed';note.textContent='الصورة غير متاحة مؤقتًا';card.append(note)}}
function loadFestivalImage(img){if(!img?.dataset.src||img.dataset.mediaState)return;img.dataset.mediaState='loading';img.closest('.media-card')?.classList.add('is-loading');img.addEventListener('load',()=>{img.dataset.mediaState='loaded';markImageReady(img)},{once:true});img.addEventListener('error',()=>{img.dataset.mediaState='failed';markImageFailed(img)},{once:true});img.src=img.dataset.src;img.removeAttribute('data-src');if(img.complete&&img.naturalWidth){img.dataset.mediaState='loaded';markImageReady(img)}}
if(galleryImages.length){if(!('IntersectionObserver'in window)){galleryImages.forEach(loadFestivalImage)}else{const galleryObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){loadFestivalImage(entry.target);galleryObserver.unobserve(entry.target)}}},{rootMargin:'420px 0px',threshold:.01});galleryImages.forEach(img=>galleryObserver.observe(img))}}

const zones=[document.querySelector('[data-pyro-zone]'),document.querySelector('[data-finale-zone]')].filter(Boolean);
if(reduce||!('IntersectionObserver'in window)){zones.forEach(z=>z.classList.add('is-live'))}else{const fired=new WeakSet();const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&!fired.has(entry.target)){fired.add(entry.target);entry.target.classList.add('is-live');setTimeout(()=>entry.target.classList.remove('is-live'),1450)}}},{threshold:.48,rootMargin:'-4% 0px -8%'});zones.forEach(z=>observer.observe(z))}

const finale=document.querySelector('[data-finale-zone]');if(finale&&!matchMedia('(pointer: coarse)').matches){finale.addEventListener('pointermove',event=>{const r=finale.getBoundingClientRect();const x=(event.clientX-r.left)/r.width-.5;const y=(event.clientY-r.top)/r.height-.5;finale.style.setProperty('--fx',x.toFixed(3));finale.style.setProperty('--fy',y.toFixed(3))},{passive:true})}
})();
