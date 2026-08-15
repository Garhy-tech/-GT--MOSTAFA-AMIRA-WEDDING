(() => {
  'use strict';

  const Core = window.GarhyInviteCore;
  if (!Core) throw new Error('GARHY_INVITE_CORE_MISSING');

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const translations = {
    ar: {
      skip:'الانتقال إلى الدعوة', navDetails:'التفاصيل', navMoments:'حكايتنا', navLocation:'المكان', navRsvp:'تأكيد الحضور',
      blessingLabel:'آية من كتاب الله', enterInvitation:'اكتشف الدعوة', heroEyebrow:'بمباركة عائلتيهما وبكل المحبة', heroInvitation:'يتشرّف مصطفى وأميرة بدعوتكم لمشاركتهما بداية العمر.', heroDay:'الجمعة', heroRsvp:'تأكيد الحضور', addCalendar:'أضف إلى التقويم', heroPlace:'دار الإشارة', heroRegion:'الماظة · القاهرة',
      countdownEyebrow:'موعدنا مع أجمل البدايات', countdownTitle:'تفصلنا عن ليلة العمر', countdownNote:'تكتمل سعادتنا بحضوركم ومشاركتكم هذه الذكرى.', days:'يوم', hours:'ساعة', minutes:'دقيقة', seconds:'ثانية',
      storyEyebrow:'حكاية بدأت بالمحبة', storyTitle:'قلبان.<br>وحياة واحدة.', storyLead:'هناك أرواح تجعل العالم أكثر هدوءًا وجمالًا بمجرد حضورها؛ وفي بعضنا وجدنا ذلك الشعور.', storyBody:'واليوم، بين أهلنا ومن ملأوا حياتنا محبة، نختار أن نكمل الطريق معًا. حضوركم هو اللمسة التي تكتمل بها فرحتنا.',
      detailsEyebrow:'تفاصيل ليلة العمر', detailsTitle:'موعدنا مع الفرح', detailsVenueLabel:'مكان الحفل', venueName:'دار الإشارة', detailDateLabel:'التاريخ', detailDate:'الجمعة، ٣١ يوليو', detailTimeLabel:'الوقت', detailTimeSub:'بداية السهرة', detailDressLabel:'الملابس', detailDressSub:'بإطلالة تليق بليلتنا', detailArrivalLabel:'الوصول', detailArrivalSub:'يسعدنا وصولكم مبكرًا',
      momentsEyebrow:'فصول من حكايتنا', momentsTitle:'لحظات صنعت الحكاية', momentsIntro:'ضحكة، ونظرة، ولحظة هدوء بين الكلمات — تفاصيل صغيرة قادتنا إلى هذا اليوم.', photoOne:'فصل جديد', photoTwo:'التفاصيل الصغيرة', photoThree:'معك يصبح كل مكان وطنًا', photoFour:'جنبًا إلى جنب', photoFive:'كل الحكاية محبة',
      locationEyebrow:'وجهة ليلة العمر', locationAddress:'الماظة', locationRegion:'محافظة القاهرة', parkingLabel:'الانتظار', parkingValue:'متاح داخل المكان', arrivalLabel:'أنسب وقت للوصول', openMaps:'افتح في خرائط Google',
      rsvpEyebrow:'مقعدكم محفوظ بمحبة', rsvpTitle:'هل تشاركوننا الفرح؟', rsvpIntro:'نرجو تأكيد حضوركم؛ فوجودكم أجمل هدية تكتمل بها ليلتنا.', month:'يوليو', attendanceLegend:'هل ستتمكنون من الحضور؟', attending:'يسعدني الحضور', declining:'أعتذر عن الحضور', nameLabel:'الاسم', nameError:'من فضلك اكتب اسمك.', guestsLabel:'عدد الضيوف', messageLabel:'كلمة للعروسين', submitRsvp:'تأكيد الرد', formNote:'يُحفظ ردّكم بصورة خاصة عند استخدام رابط الدعوة الشخصي.', successEyebrow:'شكرًا من القلب', successTitle:'تم تسجيل ردّكم.', successBody:'وصل ردّكم، وتم تجهيز بطاقة الحضور إن كانت الدعوة مؤهلة.', shareReply:'مشاركة نسخة', editReply:'تعديل الرد', passLabel:'بطاقة الحضور الرقمية',
      closedTitle:'اكتملت ليلة العمر', closedBody:'انتهى موعد تأكيد الحضور، وبقيت هذه الصفحة ذكرى رقمية للحكاية.', footerLine:'ذكرى جميلة تبدأ ولا تنتهي.', shareInvitation:'شارك الدعوة', duaEyebrow:'دعاء للعروسين', duaNote:'اللهم اجعل بيتكما سكنًا، واملأ أيامكما مودةً ورحمةً وبركة.', dockDetails:'التفاصيل', dockLocation:'المكان', nowPlaying:'موسيقى ليلة العمر',
      lifecycleUpcoming:'يسعدنا انتظاركم في هذه المناسبة.', lifecycleFinal:'اقترب الموعد — ننتظركم بكل محبة.', lifecycleLive:'اليوم موعدنا — أهلًا بكم في ليلة العمر.', lifecycleThanks:'شكرًا لكل من شاركنا هذه الليلة. أصبحت الدعوة الآن ذكرى رقمية.', lifecycleArchive:'Operation Forever — ذكرى رقمية محفوظة.',
      personalWelcome:name=>`أهلًا ${name}، يسعد مصطفى وأميرة أن تكون هذه الدعوة لك شخصيًا.`, linkRequired:'استخدم رابط الدعوة الشخصي لتأكيد الحضور بصورة آمنة.', saving:'جارٍ حفظ ردّكم…', saved:'تم حفظ ردّكم بنجاح.', saveError:'تعذر حفظ الرد الآن. حاولوا مرة أخرى.', copied:'تم نسخ الرابط.', calendarSaved:'تم تجهيز ملف التقويم.', musicError:'تعذر تشغيل الموسيقى على هذا الجهاز.'
    },
    en: {
      skip:'Skip to invitation', navDetails:'Details', navMoments:'Moments', navLocation:'Location', navRsvp:'RSVP',
      blessingLabel:'A verse of tranquility and love', enterInvitation:'Enter the invitation', heroEyebrow:'Together with their families', heroInvitation:'Joyfully invite you to share in the beginning of their forever.', heroDay:'Friday', heroRsvp:'Celebrate with us', addCalendar:'Add to calendar', heroPlace:'Dar Al Eshara', heroRegion:'Almazah · Cairo',
      countdownEyebrow:'Until our favorite day', countdownTitle:'The celebration begins in', countdownNote:'We cannot wait to make this memory with you.', days:'Days', hours:'Hours', minutes:'Minutes', seconds:'Seconds',
      storyEyebrow:'A beautiful beginning', storyTitle:'Two hearts.<br>One home.', storyLead:'Some people make the world feel softer just by being in it. We found that feeling in each other.', storyBody:'Now, surrounded by the people who shaped our lives and filled them with love, we are choosing forever. Having you there will make the day complete.',
      detailsEyebrow:'Everything you need', detailsTitle:'The day, at a glance', detailsVenueLabel:'The venue', venueName:'Dar Al Eshara', detailDateLabel:'Date', detailDate:'Friday, 31 July', detailTimeLabel:'Time', detailTimeSub:'The evening begins', detailDressLabel:'Dress code', detailDressSub:'Come as your finest self', detailArrivalLabel:'Arrival', detailArrivalSub:'A little early is perfect',
      momentsEyebrow:'Scenes from our story', momentsTitle:'Made of little moments', momentsIntro:'The laughter, the glances, the quiet in-between — every part led us here.', photoOne:'A new chapter', photoTwo:'The little things', photoThree:'Forever feels like home', photoFour:'Side by side', photoFive:'All because of love',
      locationEyebrow:'Where to meet us', locationAddress:'Almazah', locationRegion:'Cairo Governorate', parkingLabel:'Parking', parkingValue:'Available on site', arrivalLabel:'Best arrival', openMaps:'Open in Google Maps',
      rsvpEyebrow:'A seat is waiting for you', rsvpTitle:'Will you join us?', rsvpIntro:'Please let us know. Your presence is the loveliest gift we could ask for.', month:'July', attendanceLegend:'Will you be attending?', attending:'Joyfully attending', declining:'Sadly declining', nameLabel:'Your name', nameError:'Please add your name.', guestsLabel:'Guests', messageLabel:'A note for the couple', submitRsvp:'Confirm my response', formNote:'Your response is saved privately when you use your personal invitation link.', successEyebrow:'Beautiful — thank you', successTitle:'Your reply is saved.', successBody:'Your reply was received and your guest pass is ready when eligible.', shareReply:'Share a copy', editReply:'Edit my reply', passLabel:'Digital Guest Pass',
      closedTitle:'The celebration is complete', closedBody:'RSVP is now closed. This experience remains as a digital memory of the day.', footerLine:'A beautiful memory, preserved.', shareInvitation:'Share invitation', duaEyebrow:'A prayer for the newlyweds', duaNote:'May God fill your home with tranquility, affection, mercy, and blessing.', dockDetails:'Details', dockLocation:'Venue', nowPlaying:'Wedding soundtrack',
      lifecycleUpcoming:'We look forward to celebrating with you.', lifecycleFinal:'The date is close — we cannot wait to welcome you.', lifecycleLive:'Today is the day — welcome to the celebration.', lifecycleThanks:'Thank you for sharing this night with us. The invitation is now a digital memory.', lifecycleArchive:'Operation Forever — a preserved digital memory.',
      personalWelcome:name=>`Welcome ${name}. Mostafa & Amira are delighted to share this personal invitation with you.`, linkRequired:'Use your personal invitation link to RSVP securely.', saving:'Saving your response…', saved:'Your response was saved.', saveError:'We could not save your response. Please try again.', copied:'Invitation link copied.', calendarSaved:'Calendar file prepared.', musicError:'Music could not be played on this device.'
    }
  };

  const state = { event:null, lifecycle:'unknown', locale:'ar', token:null, invitation:null, client:null, rsvpMessage:'', passToken:null };
  let toastTimer;

  async function boot() {
    try {
      const response = await fetch('/app-v2/event.json', { cache:'no-store' });
      if (!response.ok) throw new Error('EVENT_CONFIG_UNAVAILABLE');
      state.event = await response.json();
    } catch {
      state.event = {
        slug:'mostafa-amira-2026', startsAt:'2026-07-31T19:00:00+03:00', endsAt:'2026-07-31T23:00:00+03:00',
        rsvpOpensAt:'2026-06-01T00:00:00+03:00', rsvpClosesAt:'2026-07-31T18:30:00+03:00', archiveAfterDays:45,
        venue:{ name:'Dar Al Eshara', mapsUrl:'https://maps.app.goo.gl/BzxKEpQVtUCoLMjm7?g_st=afm' }
      };
    }

    state.locale = Core.safeLocale(localStorage.getItem('garhy-invite-locale'), state.event.defaultLocale || 'ar');
    state.token = Core.inviteTokenFromLocation();
    state.client = Core.createClient(window.GARHY_INVITE_SUPABASE);
    state.lifecycle = Core.resolveLifecycle(state.event);

    applyLanguage(state.locale);
    applyLifecycle();
    initHeaderAndReveal();
    initCountdown();
    initMusic();
    initGallery();
    initSharing();
    initCalendar();
    initRsvp();
    initTracking();
    await resolvePersonalInvitation();

    window.GARHY_INVITE = Object.freeze({
      version:'2.0.0',
      event:state.event,
      get lifecycle(){ return state.lifecycle; },
      get locale(){ return state.locale; },
      get personalized(){ return Boolean(state.invitation); }
    });
    Core.emit('ready', { slug:state.event.slug, lifecycle:state.lifecycle });
  }

  function t(key) { return translations[state.locale][key] ?? key; }

  function applyLanguage(locale) {
    state.locale = Core.safeLocale(locale, 'ar');
    const dict = translations[state.locale];
    document.documentElement.lang = state.locale;
    document.documentElement.dir = state.locale === 'ar' ? 'rtl' : 'ltr';
    const label = $('[data-language-label]'); if (label) label.textContent = state.locale === 'ar' ? 'EN' : 'عربي';
    $$('[data-i18n]').forEach(el => {
      const value = dict[el.dataset.i18n];
      if (typeof value === 'string') el.innerHTML = value;
    });
    localStorage.setItem('garhy-invite-locale', state.locale);
    $('[data-language-toggle]')?.setAttribute('aria-label', state.locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
  }

  $('[data-language-toggle]')?.addEventListener('click', () => {
    applyLanguage(state.locale === 'ar' ? 'en' : 'ar');
    if (state.invitation?.guest?.displayName) showPersonalWelcome(state.invitation.guest.displayName);
    track('language_change', { locale:state.locale });
  });

  function applyLifecycle() {
    document.documentElement.dataset.lifecycle = state.lifecycle;
    const banner = $('[data-lifecycle-banner]');
    const key = { upcoming:'lifecycleUpcoming', 'final-countdown':'lifecycleFinal', live:'lifecycleLive', 'thank-you':'lifecycleThanks', archive:'lifecycleArchive' }[state.lifecycle];
    if (banner && key) { banner.textContent = t(key); banner.dataset.state = state.lifecycle; banner.hidden = false; }

    const open = Core.isRsvpOpen(state.event);
    const form = $('#rsvp-form');
    const closed = $('[data-rsvp-closed]');
    if (!open) {
      if (form) form.hidden = true;
      if (closed) closed.hidden = false;
      $$('[data-rsvp-cta]').forEach(link => { link.setAttribute('href', '#rsvp'); link.setAttribute('aria-label', t('closedTitle')); });
    }
  }

  async function resolvePersonalInvitation() {
    if (!state.token || !state.client) return;
    try {
      const invitation = await state.client.resolveInvitation(state.token);
      if (!invitation) return;
      state.invitation = invitation;
      if (invitation.guest?.locale) applyLanguage(invitation.guest.locale);
      if (invitation.guest?.displayName) {
        showPersonalWelcome(invitation.guest.displayName);
        const nameInput = $('#rsvp-form [name="name"]');
        if (nameInput) { nameInput.value = invitation.guest.displayName; nameInput.readOnly = true; }
      }
      const max = Number(invitation.invitation?.maxGuests || 1);
      const select = $('#rsvp-form [name="guests"]');
      if (select) {
        select.innerHTML = '';
        for (let i=1; i<=max; i++) select.add(new Option(String(i), String(i)));
      }
      if (invitation.rsvp && Core.isRsvpOpen(state.event)) hydrateRsvp(invitation.rsvp);
      Core.emit('personalized', { slug:state.event.slug });
    } catch {
      // The experience remains fully usable; only private RSVP features are withheld.
    }
  }

  function showPersonalWelcome(name) {
    const box = $('[data-personal-welcome]');
    if (!box) return;
    box.textContent = translations[state.locale].personalWelcome(name);
    box.hidden = false;
  }

  function hydrateRsvp(rsvp) {
    const form = $('#rsvp-form'); if (!form) return;
    const radio = form.querySelector(`[name="attendance"][value="${rsvp.attendance}"]`); if (radio) radio.checked = true;
    if (form.elements.guests) form.elements.guests.value = String(rsvp.guestCount || 1);
    if (form.elements.message) form.elements.message.value = rsvp.message || '';
  }

  function initHeaderAndReveal() {
    const header = $('[data-header]');
    const update = () => header?.classList.toggle('is-scrolled', scrollY > 32);
    addEventListener('scroll', update, { passive:true }); update();
    const items = $$('.reveal');
    if (reducedMotion || !('IntersectionObserver' in window)) return items.forEach(el => el.classList.add('is-visible'));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible'); observer.unobserve(entry.target);
    }), { threshold:.12, rootMargin:'0px 0px -36px' });
    items.forEach(el => observer.observe(el));
  }

  function initCountdown() {
    const fields = Object.fromEntries(['days','hours','minutes','seconds'].map(k => [k, $(`[data-countdown="${k}"]`)]));
    const tick = () => {
      const diff = Date.parse(state.event.startsAt) - Date.now();
      if (diff <= 0) return Object.values(fields).forEach(el => { if (el) el.textContent='00'; });
      const sec = Math.floor(diff/1000);
      const values = { days:Math.floor(sec/86400), hours:Math.floor((sec%86400)/3600), minutes:Math.floor((sec%3600)/60), seconds:sec%60 };
      Object.entries(values).forEach(([k,v]) => { if (fields[k]) fields[k].textContent=String(v).padStart(2,'0'); });
    };
    tick(); setInterval(tick,1000);
  }

  function initMusic() {
    const player=$('[data-music-player]'), audio=$('[data-music-audio]'), toggle=$('[data-music-toggle]'), icon=$('[data-music-icon]'), volume=$('[data-music-volume]'), progress=$('[data-music-progress]'), current=$('[data-music-current]'), duration=$('[data-music-duration]');
    if (!player || !audio || !toggle) return;
    audio.volume=.68; audio.muted=localStorage.getItem('garhy-invite-muted')==='true';
    const fmt=s=>Number.isFinite(s)?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`:'0:00';
    const sync=()=>{ const playing=!audio.paused; player.classList.toggle('is-playing',playing); toggle.setAttribute('aria-pressed',String(playing)); if(icon) icon.textContent=playing?'Ⅱ':'▶'; if(progress&&audio.duration){ const p=(audio.currentTime/audio.duration)*100; progress.value=String(p); player.style.setProperty('--music-progress',`${p}%`); } if(current) current.textContent=fmt(audio.currentTime); if(duration) duration.textContent=fmt(audio.duration); };
    toggle.addEventListener('click',async()=>{ try { audio.paused?await audio.play():audio.pause(); } catch { showToast(t('musicError')); } });
    volume?.addEventListener('click',()=>{ audio.muted=!audio.muted; volume.setAttribute('aria-pressed',String(audio.muted)); $('[data-volume-icon]').textContent=audio.muted?'OFF':'VOL'; localStorage.setItem('garhy-invite-muted',String(audio.muted)); });
    progress?.addEventListener('input',()=>{ if(audio.duration) audio.currentTime=(Number(progress.value)/100)*audio.duration; });
    ['play','pause','timeupdate','loadedmetadata'].forEach(name=>audio.addEventListener(name,sync)); sync();
  }

  function initGallery() {
    const buttons=$$('[data-gallery-index]'), dialog=$('[data-lightbox]'), image=$('[data-lightbox-image]'), caption=$('[data-lightbox-caption]');
    if (!buttons.length || !dialog) return;
    let active=0;
    const render=i=>{ active=(i+buttons.length)%buttons.length; const source=$('img',buttons[active]); if(image){image.src=source.currentSrc||source.src;image.alt=source.alt;} if(caption)caption.textContent=$('span',buttons[active])?.textContent||''; };
    const open=i=>{render(i);dialog.showModal();document.body.style.overflow='hidden';};
    const close=()=>{dialog.close();document.body.style.overflow='';buttons[active]?.focus();};
    buttons.forEach((b,i)=>b.addEventListener('click',()=>open(i)));
    $('[data-lightbox-close]')?.addEventListener('click',close); $('[data-lightbox-prev]')?.addEventListener('click',()=>render(active-1)); $('[data-lightbox-next]')?.addEventListener('click',()=>render(active+1));
    dialog.addEventListener('click',e=>{if(e.target===dialog)close();}); dialog.addEventListener('close',()=>document.body.style.overflow=''); dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')render(active-1);if(e.key==='ArrowRight')render(active+1);});
  }

  async function share({ title, text, url=location.href }) {
    if (navigator.share) { try { await navigator.share({title,text,url}); return; } catch(e){ if(e.name==='AbortError') return; } }
    await navigator.clipboard.writeText(`${text}\n${url}`); showToast(t('copied'));
  }

  function initSharing() {
    $('[data-share-invitation]')?.addEventListener('click',()=>{ share({title:'Mostafa & Amira — Operation Forever',text:state.locale==='ar'?'دعوة مصطفى وأميرة — Operation Forever':'Mostafa & Amira — Operation Forever'}); track('share',{surface:'footer'}); });
    $('[data-share-rsvp]')?.addEventListener('click',()=>share({title:'Mostafa & Amira — RSVP',text:state.rsvpMessage,url:''}));
  }

  function initCalendar() {
    $('[data-calendar]')?.addEventListener('click',()=>{
      const start=new Date(state.event.startsAt), end=new Date(state.event.endsAt); const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
      const content=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//GARHY TECH//GARHY INVITE//EN','BEGIN:VEVENT',`UID:${state.event.slug}@garhy-invite`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,'SUMMARY:Mostafa & Amira Wedding Celebration','LOCATION:Dar Al Eshara, Almazah, Cairo','END:VEVENT','END:VCALENDAR'].join('\r\n');
      const blob=new Blob([content],{type:'text/calendar;charset=utf-8'}), url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url;a.download='mostafa-amira-2026.ics';a.click();URL.revokeObjectURL(url);showToast(t('calendarSaved'));track('calendar_add');
    });
  }

  function initRsvp() {
    const form=$('#rsvp-form'), success=$('[data-rsvp-success]'), status=$('[data-rsvp-status]'), submit=$('[data-submit-label]');
    if (!form) return;
    form.addEventListener('submit',async event=>{
      event.preventDefault(); if(!Core.isRsvpOpen(state.event)) return applyLifecycle();
      const fd=new FormData(form), name=String(fd.get('name')||'').trim();
      if(name.length<2){ form.elements.name.closest('label')?.classList.add('has-error');form.elements.name.focus();return; }
      if(fd.get('website')) return;
      if(!state.token || !state.client){ status.textContent=t('linkRequired');return; }
      const attendance=String(fd.get('attendance')), guestCount=Number(fd.get('guests')||1), message=String(fd.get('message')||'').trim();
      form.setAttribute('aria-busy','true'); form.querySelector('button[type="submit"]').disabled=true; if(submit)submit.textContent=t('saving'); status.textContent='';
      try {
        const result=await state.client.submitRsvp({token:state.token,attendance,guestCount,message,locale:state.locale});
        state.passToken=result?.passToken||null; state.rsvpMessage=`Mostafa & Amira — RSVP\n${name}\n${attendance}\nGuests: ${guestCount}${message?`\n${message}`:''}`;
        form.hidden=true; success.hidden=false; success.focus();
        const pass=$('[data-guest-pass]'), code=$('[data-pass-code]'); if(state.passToken&&pass&&code){code.textContent=state.passToken;pass.hidden=false;}
        showToast(t('saved')); Core.emit('rsvp_saved',{attendance,guestCount});
      } catch { status.textContent=t('saveError'); }
      finally { form.removeAttribute('aria-busy');form.querySelector('button[type="submit"]').disabled=false;if(submit)submit.textContent=t('submitRsvp'); }
    });
    $('[data-edit-rsvp]')?.addEventListener('click',()=>{success.hidden=true;form.hidden=false;form.elements.name?.focus();});
  }

  function initTracking() {
    $('[data-map-link]')?.addEventListener('click',()=>track('map_open'));
  }

  function track(eventName, properties={}) {
    Core.emit(eventName,{slug:state.event?.slug,...properties});
    if(state.token&&state.client) state.client.track({token:state.token,eventName,locale:state.locale,properties}).catch(()=>{});
  }

  function showToast(message) {
    const toast=$('[data-toast]'); if(!toast)return; clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;requestAnimationFrame(()=>toast.classList.add('is-visible'));toastTimer=setTimeout(()=>{toast.classList.remove('is-visible');setTimeout(()=>toast.hidden=true,300);},3000);
  }

  boot().catch(error=>{ console.error('[GARHY INVITE]',error); Core.emit('boot_error',{message:error.message}); });
})();
