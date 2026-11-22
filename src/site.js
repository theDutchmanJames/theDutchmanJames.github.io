(()=>{
 'use strict';
 const root=document.documentElement;
 const explorer=document.querySelector('.feature-explorer');
 if(explorer){
  const topicButtons=[...explorer.querySelectorAll('[data-feature-topic]')];
  const topics=[...explorer.querySelectorAll('[data-topic-index]')];
  const query=explorer.querySelector('#feature-query');
  const picker=explorer.querySelector('#feature-topic-select');
  const clear=explorer.querySelector('.feature-clear');
  const status=explorer.querySelector('.feature-search-status');
  const empty=explorer.querySelector('.feature-empty');
  const normalize=text=>text.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const entries=topics.map(topic=>({
   topic,
   heading:normalize(topic.querySelector('h3').textContent),
   items:[...topic.querySelectorAll('.feature-disclosure')].map(item=>({item,text:normalize(item.textContent)}))
  }));
  let selected=0;
  function render(){
   const terms=normalize(query.value.trim()).split(/\s+/).filter(Boolean);
   const searching=terms.length>0;
   let count=0;
   entries.forEach(({topic,heading,items},i)=>{
    let visible=0;
    items.forEach(({item,text},j)=>{
     const matches=searching?terms.every(term=>(heading+' '+text).includes(term)):i===selected;
     item.hidden=!matches;
     item.open=matches&&(searching||j===0);
     if(matches){visible++;count++;}
    });
    topic.hidden=visible===0;
   });
   topicButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(!searching&&i===selected)));
   picker.value=searching?'':String(selected);
   clear.hidden=!query.value;
   empty.hidden=!searching||count>0;
   status.textContent=searching?`${count} matching ${count===1?'feature':'features'}`:'';
   explorer.classList.toggle('is-searching',searching);
  }
  function selectTopic(index){selected=index;query.value='';render();}
  topicButtons.forEach(button=>button.addEventListener('click',()=>selectTopic(Number(button.dataset.featureTopic))));
  picker.addEventListener('change',()=>selectTopic(Number(picker.value)));
  query.addEventListener('input',render);
  query.addEventListener('keydown',event=>{if(event.key==='Escape'){query.value='';render();}});
  clear.addEventListener('click',()=>{query.value='';render();query.focus();});
  explorer.querySelector('.feature-search').hidden=false;
  explorer.querySelector('.feature-topic-nav').hidden=false;
  explorer.querySelector('.feature-topic-picker').hidden=false;
  explorer.classList.add('is-ready');
  render();
 }
 const showcase=document.querySelector('.sf-showcase');
 if(showcase){
  const slides=[...showcase.querySelectorAll('[data-slide]')];
  const selectors=[...showcase.querySelectorAll('[data-spotlight]')];
  const region=document.getElementById('spotlight-slides');
  const pause=document.getElementById('spotlight-pause');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let index=0,paused=reducedMotion.matches,hovered=false,focused=false,timer;
  function schedule(){
   clearTimeout(timer);
   pause.textContent=paused?'Play':'Pause';
   pause.setAttribute('aria-label',paused?'Start app rotation':'Pause app rotation');
   region.setAttribute('aria-live',paused?'polite':'off');
   if(!paused&&!hovered&&!focused&&!document.hidden)timer=setTimeout(()=>{show(index+1);schedule();},7000);
  }
  function show(next){
   index=(next+slides.length)%slides.length;
   slides.forEach((slide,i)=>{slide.hidden=i!==index;});
   selectors.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  }
  function select(next){paused=true;show(next);schedule();}
  selectors.forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.spotlight))));
  document.getElementById('spotlight-previous').addEventListener('click',()=>select(index-1));
  document.getElementById('spotlight-next').addEventListener('click',()=>select(index+1));
  pause.addEventListener('click',()=>{paused=!paused;schedule();});
  showcase.addEventListener('mouseenter',()=>{hovered=true;schedule();});
  showcase.addEventListener('mouseleave',()=>{hovered=false;schedule();});
  showcase.addEventListener('focusin',()=>{focused=true;schedule();});
  showcase.addEventListener('focusout',event=>{if(!showcase.contains(event.relatedTarget)){focused=false;schedule();}});
  document.addEventListener('visibilitychange',schedule);
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)paused=true;schedule();});
  showcase.querySelector('.spotlight-controls').hidden=false;
  schedule();
 }
 const themeButtons=[...document.querySelectorAll('[data-theme]')].filter(e=>e.tagName==='BUTTON');
 let gallery=[],galleryIndex=0;
 const galleryData=document.getElementById('gallery-data');
 if(galleryData)gallery=JSON.parse(galleryData.textContent);
 function theme(){return root.dataset.theme==='dark'?'dark':'light';}
 function renderGallery(){
  if(!gallery.length)return;const picture=gallery[galleryIndex],frame=document.getElementById('gallery-picture');
  frame.querySelector('.theme-light').src=picture.light;frame.querySelector('.theme-dark').src=picture.dark;
  frame.querySelectorAll('img').forEach(img=>{img.alt=`SlotForge ${document.body.dataset.app} — ${picture.label}`;});
  document.getElementById('gallery-caption').textContent=picture.label+(picture.paired?` · ${theme()} theme`:'');
  document.querySelectorAll('[data-gallery]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.gallery)===galleryIndex)));
  const dialogImage=document.getElementById('dialog-image');dialogImage.src=picture[theme()];dialogImage.alt=`SlotForge ${document.body.dataset.app} — ${picture.label}`;document.getElementById('dialog-label').textContent=picture.label;
 }
 function setTheme(value,persist=true){root.dataset.theme=value;root.style.colorScheme=value;themeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===value)));if(persist)try{localStorage.setItem('slotforge-site-theme',value);}catch{}renderGallery();}
 themeButtons.forEach(b=>b.addEventListener('click',()=>setTheme(b.dataset.theme)));
 setTheme(theme(),false);
 window.addEventListener('storage',event=>{if(event.key==='slotforge-site-theme'&&['light','dark'].includes(event.newValue))setTheme(event.newValue,false);});
 document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{galleryIndex=Number(button.dataset.gallery);renderGallery();}));
 const platformButtons=[...document.querySelectorAll('[data-platform]')];
 function setPlatform(value){platformButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.platform===value)));document.querySelectorAll('[data-platform-panel]').forEach(p=>{p.hidden=p.dataset.platformPanel!==value;});try{localStorage.setItem('slotforge-site-platform',value);}catch{}}
 if(platformButtons.length){let preferred;try{preferred=localStorage.getItem('slotforge-site-platform');}catch{}if(!['Windows','macOS','Linux'].includes(preferred))preferred=/Mac/.test(navigator.platform)?'macOS':/Linux/.test(navigator.platform)?'Linux':'Windows';setPlatform(preferred);platformButtons.forEach(b=>b.addEventListener('click',()=>setPlatform(b.dataset.platform)));}
 const dialog=document.getElementById('screenshot-dialog');
 if(dialog){document.getElementById('enlarge-screenshot').addEventListener('click',()=>{renderGallery();dialog.showModal();});document.getElementById('close-screenshot').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});}
})();
// ── Upgrades: phone menu, gallery descriptions and tap-to-enlarge, sticky download bar.
(()=>{
 'use strict';
 const header=document.querySelector('.sf-header'),toggle=document.querySelector('.sf-menu-toggle');
 if(header&&toggle){
  const set=open=>{header.classList.toggle('menu-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.querySelector('.sf-menu-label').textContent=open?'Close':'Menu';};
  toggle.addEventListener('click',()=>set(!header.classList.contains('menu-open')));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.classList.contains('menu-open')){set(false);toggle.focus();}});
  header.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>set(false)));
 }
 const dataEl=document.getElementById('gallery-data'),description=document.getElementById('gallery-description');
 if(dataEl&&description){
  const gallery=JSON.parse(dataEl.textContent);
  document.querySelectorAll('[data-gallery]').forEach(b=>b.addEventListener('click',()=>{description.textContent=gallery[Number(b.dataset.gallery)]?.caption||'';}));
 }
 const picture=document.getElementById('gallery-picture'),enlarge=document.getElementById('enlarge-screenshot');
 if(picture&&enlarge){
  picture.setAttribute('role','button');picture.tabIndex=0;picture.setAttribute('aria-label','View screenshot full size');
  picture.addEventListener('click',()=>enlarge.click());
  picture.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();enlarge.click();}});
 }
 const sticky=document.querySelector('.sf-sticky-download'),actions=document.querySelector('.sf-detail-actions'),downloads=document.getElementById('downloads');
 if(sticky&&actions&&downloads&&'IntersectionObserver' in window){
  let pastActions=false,atDownloads=false;
  const update=()=>{const show=pastActions&&!atDownloads;sticky.hidden=false;sticky.classList.toggle('is-visible',show);sticky.setAttribute('aria-hidden',String(!show));sticky.querySelector('a').tabIndex=show?0:-1;};
  new IntersectionObserver(([e])=>{pastActions=!e.isIntersecting&&e.boundingClientRect.top<0;update();}).observe(actions);
  new IntersectionObserver(([e])=>{atDownloads=e.isIntersecting||e.boundingClientRect.top<0;update();},{rootMargin:'0px 0px -20% 0px'}).observe(downloads);
 }
})();
// ── Screenshot tour: previous/next, counter, arrow keys, keep the active view in sight.
(()=>{
 'use strict';
 const tour=document.querySelector('.sf-tour');if(!tour)return;
 const buttons=[...tour.querySelectorAll('[data-gallery]')],pos=document.getElementById('tour-pos'),list=tour.querySelector('.tour-list');
 const current=()=>Math.max(0,buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true'));
 const go=i=>{const b=buttons[(i+buttons.length)%buttons.length];b.click();};
 const sync=()=>{const i=current(),b=buttons[i];pos.textContent=String(i+1);
  const lr=list.getBoundingClientRect(),br=b.getBoundingClientRect();
  if(list.scrollWidth>list.clientWidth)list.scrollTo({left:list.scrollLeft+br.left-lr.left-(lr.width-br.width)/2,behavior:'smooth'});
  else if(list.scrollHeight>list.clientHeight)list.scrollTo({top:list.scrollTop+br.top-lr.top-(lr.height-br.height)/2,behavior:'smooth'});};
 buttons.forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(sync)));
 document.getElementById('tour-prev').addEventListener('click',()=>go(current()-1));
 document.getElementById('tour-next').addEventListener('click',()=>go(current()+1));
 tour.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||!e.target.closest('.tour-list,.tour-nav'))return;e.preventDefault();const f=buttons.indexOf(e.target.closest('[data-gallery]')),i=(f>=0?f:current())+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1);go(i);if(e.target.closest('.tour-list'))buttons[(i+buttons.length)%buttons.length].focus();});
})();
