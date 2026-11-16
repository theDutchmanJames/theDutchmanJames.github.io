// Gallery screenshots for SlotForge Telemetry. Run: node capture-telemetry.cjs [slug ...]
// Isolated profile via lib.launch(); seeds a Paddock race-result cache file plus the renderer's localStorage.
const path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto');
const {launch,shot,CLAUDE}=require('./lib.cjs');
const APP='Telemetry',ROOT=path.join(CLAUDE,'Telemetry');
// Read-only use of the app's own pure Node modules to build a valid race cache.
const {hash,checkCache}=require(path.join(ROOT,'src/paddock-client.cjs'));
const {summaries}=require(path.join(ROOT,'src/paddock-statistics.cjs'));
const explore=process.env.EXPLORE&&require(path.resolve(process.env.EXPLORE));
const only=process.argv.slice(2);

// ---------- Race results (Paddock cache) ----------
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/2**32;};}
const hex=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const HOST='friday-night-club',LANE_M=21.4;
const CARS={
 alex:{driver:'Alex',car:'NSR Porsche 997 · No. 27',carId:'nsr-porsche-997-27',lane:1,base:7.02,tech:{motor:'NSR King 21.4k',ratedRpm:'21400',ratedVoltage:'12',pinion:'9',gear:'27',rearTyres:'NSR Supergrip 20.2',rearDiameter:'20.2',weight:'82',guide:'NSR long guide',braids:'Slot.it fine braid'}},
 jamie:{driver:'Jamie',car:'Slot.it Audi R8',carId:'slotit-audi-r8',lane:2,base:6.98,tech:{motor:'Slot.it V12/4 21.5k',ratedRpm:'21500',ratedVoltage:'12',pinion:'10',gear:'28',rearTyres:'Slot.it P6 20.5',rearDiameter:'20.5',weight:'84'}},
 morgan:{driver:'Morgan',car:'Scaleauto BMW M3',carId:'scaleauto-bmw-m3',lane:3,base:7.21,tech:{motor:'Scaleauto SC-28 21k',ratedRpm:'21000',ratedVoltage:'12',pinion:'11',gear:'31',rearTyres:'Scaleauto ProComp 20.0',rearDiameter:'20.0',weight:'86'}},
 sam:{driver:'Sam',car:'NSR Corvette C7.R',carId:'nsr-corvette-c7r',lane:4,base:7.12,tech:{motor:'NSR Shark 20k',ratedRpm:'20000',ratedVoltage:'12',pinion:'10',gear:'27',rearTyres:'NSR Supergrip 20.0',rearDiameter:'20.0',weight:'83'}}
};
// Seven Friday practice nights; Alex's car evolves (gearing on 23 Oct, tyres on 6 Nov).
const NIGHTS=[['2026-10-02',0.22],['2026-10-09',0.17],['2026-10-16',0.13],['2026-10-23',0.08],['2026-10-30',0.06],['2026-11-06',0.03],['2026-11-13',-0.02]];
function participant(key,c,night,idx,r,{laps=24,stints=1,startMs=0}){
 const tech={...c.tech};
 if(key==='alex'&&idx>=3)tech.gear='28';
 if(key==='alex'&&idx>=5){tech.rearTyres='NSR Supergrip 20.4 (trued)';tech.rearDiameter='20.4';}
 const pid='p-'+key,cfg={databaseId:HOST,carId:c.carId,kind:'current',configurationId:hex([c.carId,tech]),revision:hex([c.carId,tech,'r']),carRevision:1+idx,capturedAt:night+'T18:30:00.000Z',technical:tech,components:[],signature:hex([c.carId,tech,'s'])};
 const improve=key==='alex'?NIGHTS[idx][1]:NIGHTS[idx][1]*0.4;
 const st=[],lp=[];let t=startMs,n=0;
 for(let s=0;s<stints;s++){
  const sid=`${pid}-s${s+1}`,s0=t;
  for(let i=0;i<laps;i++){
   n++;let d=c.base+improve+(r()-0.5)*0.16+(i===0?0.16:0)+Math.max(0,i-14)*0.004*(s===0?1:0.5);
   let valid=true,pit=false,reason='';
   if(key!=='alex'&&i>2&&r()<0.04){d+=2.2+r();valid=false;reason='Deslot';}
   if(key==='alex'&&idx===6&&s===0&&i===11){d+=2.6;valid=false;reason='Deslot · turn 4';}
   if(s<stints-1&&i===laps-1){pit=true;d+=4.5;reason='Pit lane · tyre clean';}
   const ms=Math.round(d*1000);t+=ms;
   lp.push({id:`${pid}-l${n}`,stintId:sid,number:n,durationMs:ms,endedAtMs:t,valid,pit,recordEligible:valid&&!pit&&i>0&&!reason,countsForDistance:true,distanceM:LANE_M,reason});
  }
  t+=400;st.push({id:sid,heatId:'heat-1',driverId:'d-'+key,lane:c.lane,startedAtMs:s0,endedAtMs:t});
 }
 return {p:{id:pid,kind:'physical',carId:c.carId,configuration:cfg,displayName:c.car,drivers:[{id:'d-'+key,name:c.driver}],stints:st,laps:lp},end:t};
}
function session(night,idx){
 const r=rng(1000+idx*77),last=idx===NIGHTS.length-1;
 const parts=Object.entries(CARS).map(([k,c])=>participant(k,c,night,idx,r,{laps:last&&k==='alex'?16:20,stints:last&&k==='alex'?2:1}));
 const end=Math.max(...parts.map(x=>x.end))+1000;
 const p={integrationVersion:1,databaseId:HOST,source:{id:'club-timing',name:'Club Timing PC',application:'SlotForge Timing'},sessionId:'practice-'+night,revision:1,state:'active',name:'Friday practice',type:'practice',
  startedAt:night+'T19:30:00.000Z',endedAt:new Date(Date.parse(night+'T19:30:00.000Z')+end).toISOString(),
  track:{id:'club-circuit',name:'Club Circuit',lanes:[1,2,3,4].map(l=>({lane:l,lengthM:LANE_M}))},
  heats:[{id:'heat-1',name:'Practice',startedAtMs:0,endedAtMs:end}],participants:parts.map(x=>x.p),standings:[],adjustments:[],notes:'Friday Night Club · Club GT practice'};
 const ranked=parts.map(x=>x.p).sort((a,b)=>Math.min(...a.laps.filter(l=>l.recordEligible).map(l=>l.durationMs))-Math.min(...b.laps.filter(l=>l.recordEligible).map(l=>l.durationMs)));
 p.standings=ranked.map((x,i)=>({participantId:x.id,position:i+1,status:'finished',classifiedLaps:x.laps.length,classifiedElapsedMs:x.laps.at(-1).endedAtMs,points:0}));
 const receipt={ok:true,integrationVersion:1,databaseId:HOST,sourceId:'club-timing',sessionId:p.sessionId,revision:1,state:'active',contentHash:hash(p),receivedAt:night+'T22:00:00.000Z',duplicate:false,warnings:[],summaries:summaries(p)};
 return {payload:p,receipt};
}
function raceCache(){
 const data={version:1,hosts:[{id:HOST,name:'Friday Night Club',revision:42,syncedAt:'2026-11-13T22:05:00.000Z',results:NIGHTS.map(([d],i)=>session(d,i))}]};
 checkCache(data);return data;
}

// ---------- Setups (library + workbench) ----------
const chassis={chassisGuideSpan:'98',chassisTrack:'58',chassisMode:'tripod',chassisConfirmed:'yes',chassisFront:'21.5',chassisLeft:'30.5',chassisRight:'30',chassisCheckMass:'82',chassisBound:'0.1',chassisCheckBound:'0.1',chassisNotes:'Level non-magnetic supports; front support centred at guide pivot.',chassisChanges:JSON.stringify([{action:'add',name:'Rear ballast',mass:'3',x:'78',y:'0'},{action:'add',name:'Left sill',mass:'1.5',x:'52',y:'-18'}]),chassisMaxMass:'90'};
const tyres={tyreSet:'NSR Supergrip · Club Circuit set 2',tyreMinimum:'19.6',tyreRequiredGap:'0.5',tyreLeft:'20.22',tyreRight:'20.18',tyreSamples:'20.20,20.22,20.18,20.21',tyreHistory:'0,20.60\n120,20.42\n260,20.31\n410,20.20',gearDiameter:'18.4',wornDiameter:'19.8'};
const magnet={magneticClearance:'1.1',magneticWearMode:'axle',magneticReadings:'19.6,20.1,20.4',magneticCurve:'0.8,27\n1.0,21.5\n1.2,17.5\n1.4,14.5',magneticTester:'Club magnet tester',magneticRails:'Steel',magneticOrientation:'Inline',magneticCondition:'off',magneticExtra:'none',magneticLimit:'22'};
const base={tyreMode:'diameter',motorType:'Brushed DC',torqueType:'Stall',ratedVoltage:'12',torqueVoltage:'12',efficiency:'85',trackLength:'21.4',scaleFactor:'32',wheelbase:'78',frontWeight:'34',rearWeight:'48'};
const SETUPS=[
 {id:'porsche-27-28t',notes:'Alex · Club GT. 9:28 since 23 Oct, trued Supergrips. Best 6.93 s on lane 1.',days:0,setup:{...base,...tyres,...chassis,...magnet,name:'NSR Porsche 997 · No. 27 · Club Circuit',pinion:'9',gear:'28',ratedRpm:'21400',motorTorque:'290',rearDiameter:'20.2',totalWeight:'82',ballast:'4.5',ballastPosition:'60',lapTime:'7.01'}},
 {id:'porsche-27-27t',notes:'Alex · previous baseline, 9:27. Faster down the straight, harder to drive out of turn 4.',days:24,setup:{...base,...tyres,name:'NSR Porsche 997 · 9:27 baseline',pinion:'9',gear:'27',ratedRpm:'21400',motorTorque:'290',rearDiameter:'20.6',totalWeight:'80.5',ballast:'3',ballastPosition:'62',lapTime:'7.05'}},
 {id:'audi-r8',notes:'Jamie · Slot.it V12/4, P6 rears. Club GT spec, magnet removed.',days:3,setup:{...base,name:'Slot.it Audi R8 · Jamie',pinion:'10',gear:'28',ratedRpm:'21500',motorTorque:'280',rearDiameter:'20.5',totalWeight:'84',ballast:'5',ballastPosition:'55',frontWeight:'36',rearWeight:'48',gearDiameter:'19',lapTime:'6.95'}},
 {id:'bmw-m3',notes:'Morgan · Scaleauto SC-28, extra front lead for the hairpin.',days:6,setup:{...base,name:'Scaleauto BMW M3 · Morgan',pinion:'11',gear:'31',ratedRpm:'21000',motorTorque:'270',rearDiameter:'20.0',totalWeight:'86',ballast:'6',ballastPosition:'30',frontWeight:'38',rearWeight:'48',gearDiameter:'19.6',lapTime:'7.18'}},
 {id:'corvette-c7r',notes:'Sam · NSR Shark 20k, 10:27. Smooth and consistent, needs more top speed.',days:9,setup:{...base,name:'NSR Corvette C7.R · Sam',pinion:'10',gear:'27',ratedRpm:'20000',motorTorque:'265',rearDiameter:'20.0',totalWeight:'83',ballast:'4',ballastPosition:'58',frontWeight:'35',rearWeight:'48',gearDiameter:'18.4',lapTime:'7.10'}},
 {id:'audi-r8-wet',notes:'Jamie · low-grip night: one tooth shorter, softer rears.',days:15,setup:{...base,name:'Slot.it Audi R8 · low-grip test',pinion:'10',gear:'29',ratedRpm:'21500',motorTorque:'280',rearDiameter:'20.8',totalWeight:'85',ballast:'6',ballastPosition:'55',frontWeight:'37',rearWeight:'48',gearDiameter:'19',lapTime:'7.08'}}
];

async function seedStorage(page){
 await page.evaluate(({SETUPS})=>{
  const now=Date.parse('2026-11-14T10:00:00.000Z');
  const entries=SETUPS.map(s=>{const t=new Date(now-s.days*86400000-s.days*3600000).toISOString();return {id:s.id,setup:CalculatorModel.cleanSetup({...CalculatorModel.blank(),...s.setup}),notes:s.notes,createdAt:t,updatedAt:t};});
  localStorage.clear();
  localStorage.setItem('slotforge.telemetry.library.v1',LibraryModel.encode(entries));
  localStorage.setItem('slotforge.telemetry.library.active.v1',entries[0].id);
  localStorage.setItem('slotforge.telemetry.result-folders.v1',JSON.stringify({active:'performance',pinned:[]}));
  localStorage.setItem('slotforge.calculator.workspace.v1',CalculatorModel.encode(entries[0].setup,null));
 },{SETUPS});
}

// ---------- Helpers ----------
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// Capture-only CSS (inserted from the main process; the app's CSP blocks page style tags):
// hidden scrollbars/caret/toasts, and the body as scroll container, because lib.shot clips at document y=0.
const CSS='html{overflow:hidden!important;height:100%!important}body{height:100%!important;overflow-y:auto!important}::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}*{caret-color:transparent!important}#toast{display:none!important}#input-help-name{display:none!important}body[data-capture=balance] .preview-title .hint{display:none!important}';
async function css(app){await app.evaluate(({BrowserWindow},c)=>BrowserWindow.getAllWindows()[0].webContents.insertCSS(c),CSS);}
async function go(page,hash){await page.evaluate(h=>{location.hash=h;},hash);await sleep(500);}
// Scroll the body so selector sits offset px below the top (null = top of page).
async function top(page,selector,offset=0){
 await page.evaluate(([s,o])=>{const b=document.body,e=s&&document.querySelector(s);b.scrollTop=e?e.getBoundingClientRect().top+b.scrollTop-o:0;document.activeElement?.blur?.();},[selector,offset]);await sleep(400);
}
async function tone(page,t){await page.click(`[data-tone-choice=${t}]`);await page.mouse.move(1,1);await sleep(400);}
async function analysis(page,topic){await go(page,'analyze');await page.evaluate(t=>{analysisId='porsche-27-28t';renderAnalysis();selectAnalysisTopic(t);},topic);}
const change=(page,sel,value)=>page.evaluate(([s,v])=>{const e=document.querySelector(s);if(!e)return;e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));e.dispatchEvent(new Event('input',{bubbles:true}));},[sel,value]);

const VIEWS=[];
const view=(slug,fn)=>VIEWS.push({slug,fn});

view('workbench',async page=>{await go(page,'telemetry');await top(page,null);});
view('setup-analysis',async page=>{await analysis(page,'performance');await top(page,null);});
view('compare-setups',async page=>{await go(page,'analyze/compare');await page.evaluate(()=>{compareA='porsche-27-27t';compareB='porsche-27-28t';renderAnalysis();});await top(page,'[data-page=analyze] .page-head',24);});
view('library',async page=>{await go(page,'library');await top(page,null);});
view('lap-analysis',async page=>{await go(page,'analyze/races');await top(page,'.race-filters',12);});
view('progress',async page=>{await go(page,'analyze/progress');
 const g=await page.evaluate(()=>[...document.querySelectorAll('#progress-group option')].find(o=>/Porsche/.test(o.textContent))?.value);
 if(g)await change(page,'#progress-group',g);await sleep(300);await top(page,'.race-filters',12);});
view('balance',async page=>{await go(page,'telemetry');await page.evaluate(()=>focusSetupInput('chassisGuideSpan'));await sleep(400);await page.evaluate(()=>document.body.dataset.capture='balance');await sleep(200);await top(page,'.input-column',24);
});
view('clearance',async page=>{await analysis(page,'wear');await top(page,'[data-page=analyze] .page-head',24);});
view('driver-feedback',async page=>{await go(page,'feedback');
 await page.evaluate(()=>{Object.assign(state.setup,{adviceSymptom:'slide',adviceStep:'checks'});fillInputs();persist();});
 await page.click('[data-feedback-step=checks]');await sleep(300);
 await change(page,'[data-feedback-panel=checks] [data-feedback-question=adviceSlideWhen]','power');await sleep(300);
 await top(page,null);});

(async()=>{
 const cache=raceCache();
 const {app,page}=await launch(APP,{seed:async profile=>{const ud=path.join(profile,'userData');fs.mkdirSync(ud,{recursive:true});fs.writeFileSync(path.join(ud,'paddock-results-v1.json'),JSON.stringify(cache));}});
 const ud=await app.evaluate(({app})=>app.getPath('userData'));
 if(!fs.existsSync(path.join(ud,'paddock-results-v1.json')))throw Error('Race cache not in isolated userData: '+ud);
 page.on('console',m=>{if(m.type()==='error')console.log('[renderer]',m.text());});
 await page.waitForSelector('#load-example');await sleep(800);
 await seedStorage(page);await page.reload();await page.waitForSelector('#load-example');await sleep(1200);
 await css(app);
 if(explore){await explore({app,page,shot:n=>shot(page,'probe',n),go,top,tone,sleep});await app.close();return;}
 for(const {slug,fn} of VIEWS){
  if(only.length&&!only.includes(slug))continue;
  for(const t of ['light','dark']){
   await tone(page,t);await fn(page);await sleep(300);
   await shot(page,APP,`${slug}-${t}`);
  }
 }
 await app.close();
})().catch(e=>{console.error(e);process.exit(1);});
