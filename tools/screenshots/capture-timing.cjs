// Gallery screenshots for SlotForge Timing. Run: node capture-timing.cjs [slug ...]
// Isolated profile via lib.launch(). Timing also opens a cross-app shared library under %LOCALAPPDATA%
// and looks for legacy data under %APPDATA%; both are pointed into the throwaway profile too, so the
// real SlotForge library is never opened. Demo data is created through the app's own renderer API.
const path=require('node:path'),fs=require('node:fs');
const {launch,shot}=require('./lib.cjs');
const APP='Timing';
const only=process.argv.slice(2);
const explore=process.env.EXPLORE&&require(path.resolve(process.env.EXPLORE));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const want=slug=>!only.length||only.includes(slug);

// ---------- Demo data (built in the renderer through api.*) ----------
async function seed(page){
 return page.evaluate(async()=>{
  const T=await api.add('tracks',{name:'Club Circuit',lanes:4,scale:'1:32',surface:'Routed MDF',length:21.4,targetLap:5.8,minLap:3,deslotTime:9,notes:'Friday Night Club home track · 4-lane routed circuit'});
  const D={};for(const [n,nick,cs,flag] of [['Alex','The Professor','ALX','nl'],['Jamie','Late Braker','JAM','gb'],['Morgan','Mo','MOR','de'],['Sam','Steady Sam','SAM','be']])D[n]=await api.add('drivers',{name:n,nickname:nick,callsign:cs,flag});
  const L=await api.libraryCar(null);
  const CARS=[['NSR','Porsche 997','27','Martini'],['Slot.it','Audi R8','8','Audi Sport'],['Scaleauto','BMW M3','42','BMW Motorsport'],['NSR','Corvette C7.R','3','Corvette Racing']];
  for(const [maker,model,number,livery] of CARS)await api.librarySave({databaseId:L.schema.databaseId,recoveryId:L.schema.recoveryId,action:'create',set:{name:maker+' '+model,maker,model,number,livery,scale:'1:32',raceClass:'GT'}});
  let all=[];for(let i=0;i<40&&all.length<4;i++){all=await api.list('slotcars');if(all.length<4)await new Promise(r=>setTimeout(r,150));}
  const C={};for(const [maker,model] of CARS)C[model]=all.find(c=>c.model===model);
  const F=await api.add('fuelrules',{name:'Club endurance fuel',tank:150,perLap:2.5,rate:10,paceSource:'track',paceTrack:T.id,empty:'warn'});
  const TW=await api.add('tyrewearsystems',{name:'Club GT tyres',tyres:{...TyreWear.DEFAULT_TYRES,M:{...(TyreWear.DEFAULT_TYRES.M||{}),wear:1.4}}});
  const WX=await api.add('weathersystems',{name:'Changeable evening'});
  const chart=await api.add('chartdesigns',{...ChartWidgets.clean({name:'Lap trend',style:'trend',drivers:'all',history:'20',reference:'track',legend:true}),id:undefined});
  const w=(type,lane,x,y,ww,h,opt,extra)=>{const g=Widgets.newWidget(type,lane,x,y);g.w=ww;g.h=h;if(opt)g.opt={...(g.opt||{}),...opt};if(extra)Object.assign(g,extra);return g;};
  const widgets=[w('clock',null,10,10,200,60),w('info',null,220,10,230,60),w('flag',null,460,10,120,60),w('wxconditions',null,590,10,400,60),
   w('leaderboard',null,10,80,570,290,{colLast:true,colFuel:true,colTyres:true,colGap:true},{textSize:24}),
   w('racechart',null,590,80,400,290,{chartDesign:chart.id})];
  for(let l=0;l<4;l++)widgets.push(w('aiolane',l,10+l*245,380,235,172));
  const LY=await api.add('layouts',{name:'Club night TV',ratioW:16,ratioH:9,guides:{v:[],h:[]},laneColors:[],widgets});
  const S=await api.add('racesetups',{name:'Friday Night Club GT',track:T.id,sessionType:'race',raceBy:'laps',laps:20,endRule:'all',firstLap:'count',lightsMin:0,lightsMax:0,fuelRules:F.id,tyreWear:TW.id,weather:WX.id,layout:LY.id});
  const grid=[['Alex','Porsche 997'],['Jamie','Audi R8'],['Morgan','BMW M3'],['Sam','Corvette C7.R']];
  state.settings=await api.setSettings({lastSetupId:S.id,assignments:{[S.id]:grid.map(([d,c])=>({driverId:D[d].id,carId:C[c].id}))},timingHw:'none'});
  return {track:T,setup:S,rows:grid.map(([d,c])=>({driverId:D[d].id,carId:C[c].id})),ids:{track:T.id,setup:S.id,fuel:F.id,tyre:TW.id,weather:WX.id,layout:LY.id,chart:chart.id}};
 });
}

// Run laps through the real race engine: base lap time per lane plus a little variation.
async function simulate(page,{elapsed,base,extra={}}){
 await page.evaluate(({elapsed,base,extra})=>{
  const e=live.engine(),t=performance.now();e.t0=t-elapsed;e.cars.forEach(c=>c.last=e.t0);
  const tt=e.cars.map(()=>e.t0),ev=[];
  for(let lap=0;lap<60;lap++)e.cars.forEach((c,i)=>{tt[i]+=Math.round((base[i]+Math.sin(lap*1.7+i*2.1)*0.09+Math.cos(lap*0.6+i)*0.05+(lap===0?0.45:0)+((extra[i]||{})[lap]||0))*1000);if(tt[i]<t-250)ev.push([tt[i],i]);});
  ev.sort((a,b)=>a[0]-b[0]).forEach(([tm,i])=>e.cross(i,tm));
 },{elapsed,base,extra});
}

// ---------- Helpers ----------
async function mainWindow(app){let p;for(let i=0;i<120&&!p;i++){p=app.windows().find(w=>w.url().endsWith('index.html'));if(!p)await sleep(500);}if(!p)throw Error('Main window not found');return p;}
async function theme(page,t){await page.evaluate(async t=>{state.settings=await api.setSettings({theme:t});applyTheme();},t);await sleep(300);}
async function settle(page){
 await page.evaluate(()=>{document.activeElement?.blur?.();for(const p of document.querySelectorAll('p.muted'))if(/^(Shared library|Paddock cars):/.test(p.textContent))p.remove();});
 await page.mouse.move(1599,962);await sleep(600);
}
async function themed(page,slug,prep){
 if(!want(slug))return;
 for(const t of ['light','dark']){await theme(page,t);if(prep)await prep(t);await settle(page);await shot(page,APP,`${slug}-${t}`);}
}
async function tab(page,t,extra={}){await page.evaluate(async([t,extra])=>{Object.assign(state,extra);state.tab=t;await render();window.scrollTo(0,0);},[t,extra]);await sleep(500);}

(async()=>{
 const env={SF_UI_QA_RUN_ID:'capture'};
 const {app}=await launch(APP,{env,seed:async profile=>{
  // lib builds the child environment after seed(): point the shared library and legacy lookups into the profile.
  env.LOCALAPPDATA=path.join(profile,'localappdata');env.APPDATA=path.join(profile,'appData');fs.mkdirSync(env.LOCALAPPDATA,{recursive:true});
 }});
 try{
  const page=await mainWindow(app);
  page.on('pageerror',e=>console.log('PAGEERROR',e.message));
  page.on('dialog',d=>d.accept().catch(()=>{}));
  await page.waitForFunction(()=>typeof state!=='undefined'&&typeof render==='function'&&state.settings,null,{timeout:60000});await sleep(1000);
  const lib=await page.evaluate(()=>api.libraryStatus?api.libraryStatus():null).catch(()=>null);
  const ids=await seed(page);
  if(explore){await explore({app,page,ids,shot:n=>shot(page,'probe',n),sleep,simulate,tab,theme,settle});return;}
  // ── Live race: start the seeded setup and feed ~2 minutes of laps through the real engine.
  await page.addStyleTag({content:'html{scrollbar-width:none}::-webkit-scrollbar{display:none}'});
  const needRace=!only.length||only.some(s=>['live-race','results','race-setup'].includes(s));
  if(needRace){
   await page.evaluate(async({track,setup,rows})=>{state.race={setup,track,rows};state.tab='race';await render();document.getElementById('sim').checked=true;live.actions.start();},ids);
   // The app's own "Simulated cars" option drives the laps in real time (20-lap race, about 2 minutes).
   await sleep(45000);
   await themed(page,'live-race');
   // ── Results: wait for the finish, show the director's final check, then finalize so Home shows the podium.
   for(let i=0;i<40;i++){if(await page.evaluate(()=>!raceActive()))break;await sleep(4000);}
   await sleep(2500);
   await themed(page,'results');
   await page.locator('button',{hasText:'Finalize results'}).first().click();await sleep(2500);
   await tab(page,'home');await sleep(1500);
   await themed(page,'race-setup');
  }

  // ── Sub-pages: open a section, optionally its first editor, capture, close again.
  const closeAll=async()=>{for(let i=0;i<3;i++){const c=page.locator('button:visible',{hasText:/^Cancel$/});if(await c.count())await c.first().click().catch(()=>{});else await page.keyboard.press('Escape');await sleep(300);}};
  const sub=async(slug,t,txt,edit)=>{
   if(!want(slug))return;
   try{
    await tab(page,t);await page.locator('#view button',{hasText:txt}).first().click({timeout:8000});await sleep(900);
    if(edit){await page.locator('#view button',{hasText:/^Edit/}).first().click({timeout:8000});await sleep(1000);}
    await themed(page,slug);
   }catch(e){console.log('FAILED',slug,e.message.split(String.fromCharCode(10))[0]);}
   await closeAll();
  };
  await sub('fuel','setup','Fuel Systems',true);
  await sub('tyre-wear','setup','Tyre Wear Systems',true);
  await sub('weather','setup','Weather Systems',true);
  await sub('race-director','settings','Race Director',false);
  await sub('help','settings','Help',false);
  // Widget Builder and Audio calls: open the app's own "new" editors so the pages are not empty lists.
  // The editor's own Name field (found by its label), typed like a user would.
  const setName=async n=>{const id=await page.evaluate(()=>{const inp=[...document.querySelectorAll('#view input')].find(i=>{const l=i.labels?.[0]?.textContent?.trim()||i.closest('label,.field,div')?.querySelector('label')?.textContent?.trim()||i.previousElementSibling?.textContent?.trim();return l==='Name'&&i.offsetParent;});if(!inp)return null;inp.dataset.sfName='1';return true;});if(!id){console.log('name field not found');return;}const f=page.locator('[data-sf-name="1"]');await f.fill(n);await f.press('Tab');await sleep(400);};
  const fresh=async(slug,t,txt,btn,after)=>{
   if(!want(slug))return;
   try{await tab(page,t);await page.locator('#view button',{hasText:txt}).first().click({timeout:8000});await sleep(800);
    await page.locator('button:visible',{hasText:btn}).first().click({timeout:8000});await sleep(1500);
    if(after)await after();
    await themed(page,slug);
   }catch(e){console.log('FAILED',slug,e.message.split(String.fromCharCode(10))[0]);await shot(page,'probe','fail-'+slug);}
   await closeAll();
  };
  await fresh('widget-builder','custom','Widget Builder','New canvas widget',async()=>{
   const opts=await page.evaluate(()=>{const sel=[...document.querySelectorAll('select')].find(x=>[...x.options].some(o=>/template/i.test(o.text)));if(!sel)return null;const o=[...sel.options].map(o=>o.text);const pick=[...sel.options].find(o=>o.value&&/lane|driver|card/i.test(o.text))||[...sel.options].find(o=>o.value);sel.value=pick.value;sel.dispatchEvent(new Event('change',{bubbles:true}));return {o,picked:pick.text};});
   console.log('templates',JSON.stringify(opts));await sleep(1200);
   await setName('Lane card · Friday Night Club');
  });
  await fresh('audio-calls','custom','Audio Settings','New audio set',()=>setName('Friday Night Club commentary'));
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exit(1);});
