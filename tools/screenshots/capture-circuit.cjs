// Gallery screenshots for SlotForge Circuit. Run: node capture-circuit.cjs [slug ...]
// Circuit is a browser app; it runs inside the minimal circuit-shell (browser mode) via lib.launch().
// Demo data is generated with Circuit's own geometry code (circuit-data/layout.cjs) and imported
// through the app's hidden #layout-file input, so nothing outside the throwaway profile is touched.
const path=require('node:path');
const {launch,shot,CLAUDE}=require('./lib.cjs');
const L=require('./circuit-data/layout.cjs');
const APP='Circuit';
const only=new Set(process.argv.slice(2));
const want=s=>!only.size||only.has(s);

// ---- demo data -----------------------------------------------------------------------------
function clubLayout({measurements=false}={}){
 const half='S,S,S,S,C,C,C,aL,aL,aL,B,B,B,B,B,B'.split(',');
 const r=L.layout([...half,...half],{title:'Club Circuit',guide:{margin:200},timing:{index:1}});
 // Two-board club table (Table Designer splits these into transport panels).
 Object.assign(r.raw.workspace.spaceGuide,{x:-910,y:-300,lengthMm:4200,widthMm:2800,kind:'table',locked:true,
  shape:{type:'boards',version:1,boards:[{id:'left',name:'Left board',x:0,y:0,lengthMm:2100,widthMm:2800,locked:false},{id:'right',name:'Right board',x:2100,y:0,lengthMm:2100,widthMm:2800,locked:false}]}});
 const fam='slotforge.carrera-evolution-digital|sku:';
 r.raw.workspace.planning={version:1,
  measurements:measurements?[
   {id:'m-edge',a:[-910,1650],b:[-700,1650],label:'Table edge',print:true},
   {id:'m-width',a:[-800,-100],b:[-800,2300],label:'Overall width',print:true},
   {id:'m-gap',a:[400,1000],b:[1460,1000],label:'Infield',print:true}]:[],
  owned:{[fam+'20020509']:6,[fam+'20020572']:12,[fam+'20020573']:4,[fam+'20020577']:8,[fam+'20020560']:10,[fam+'20020562']:12,[fam+'20020591']:12,[fam+'20020563']:2,[fam+'20020592']:2}};
 return r.raw;
}

// ---- helpers -------------------------------------------------------------------------------
const CSS=`#toast{display:none!important}
::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}
*{scrollbar-width:none!important}
*:focus-visible{outline:none!important}`;
async function prep(page){
 await page.addStyleTag({content:CSS}).catch(()=>{});
}
async function settle(page,ms=400){
 await page.mouse.move(2,960);
 await page.evaluate(()=>{document.activeElement?.blur?.();const s=document.getElementById('status');if(s&&!/selected/.test(s.textContent))s.textContent='Ready';});
 await page.waitForTimeout(ms);
}
async function both(page,slug,before){
 for(const theme of ['light','dark']){
  await page.evaluate(t=>document.querySelector(`[data-theme-choice=${t}]`).click(),theme);await page.waitForTimeout(450);
  if(before)await before(theme);
  await settle(page);
  await shot(page,APP,`${slug}-${theme}`);
 }
}
async function go(page,hash){await page.evaluate(h=>location.hash=h,hash);await page.waitForTimeout(700);await prep(page);}
async function importLayout(page,raw){
 await go(page,'builder');
 await page.setInputFiles('#layout-file',{name:'club-circuit.slotforge.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(raw))});
 await page.waitForTimeout(500);
 if(await page.locator('#confirm-dialog[open]').count())await page.click('#confirm-go');
 await page.waitForTimeout(900);
}
async function folder(page,sel,open){
 await page.evaluate(([sel,open])=>{const d=document.querySelector(sel);if(d)d.open=open;},[sel,open]);
}
async function closeFolders(page){
 await page.evaluate(()=>document.querySelectorAll('#layout-panel details').forEach(d=>{if(d.id!=='selection-folder')d.open=false;}));
}
async function wheelAt(page,x,y,ticks){
 await page.mouse.move(x,y);
 for(let i=0;i<Math.abs(ticks);i++){await page.mouse.wheel(0,Math.sign(ticks)*100);await page.waitForTimeout(60);}
 await page.waitForTimeout(250);
}
// Zoom in at the canvas centre, then Space+drag so world point (wx,wy) sits at the centre.
async function zoomTo(page,wx,wy,ticks){
 const [cx,cy]=await canvasCentre(page);
 await wheelAt(page,cx,cy,-ticks);
 const [sx,sy]=await page.evaluate(([x,y])=>{const m=document.getElementById('roads').getScreenCTM();return [m.a*x+m.c*y+m.e,m.b*x+m.d*y+m.f];},[wx,wy]);
 await page.keyboard.down('Space');
 await page.mouse.move(cx,cy);await page.mouse.down();
 await page.mouse.move(cx+(cx-sx)/2,cy+(cy-sy)/2,{steps:6});await page.mouse.move(cx+(cx-sx),cy+(cy-sy),{steps:6});
 await page.mouse.up();await page.keyboard.up('Space');await page.waitForTimeout(250);
}
async function canvasCentre(page){
 const b=await page.locator('#canvas').boundingBox();return [b.x+b.width/2,b.y+b.height/2,b];
}
async function saveDesign(page,name){
 await go(page,'builder');
 await page.click('#save-design');await page.waitForTimeout(400);
 await page.fill('#design-name',name);
 await page.click('#design-save-submit');await page.waitForTimeout(900);
 if(await page.locator('#save-design-dialog[open]').count())await page.keyboard.press('Escape');
}

// ---- capture -------------------------------------------------------------------------------
(async()=>{
 const {app,page}=await launch(APP,{appRoot:path.join(__dirname,'circuit-shell'),electronPath:require(path.join(CLAUDE,'Decals/node_modules/electron')),env:{SF_CIRCUIT_ROOT:path.join(CLAUDE,'Circuit')}});
 page.on('pageerror',e=>console.log('pageerror',e.message));
 page.on('dialog',d=>d.accept().catch(()=>{}));
 await page.waitForTimeout(2500);await prep(page);
 const club=clubLayout();
 await importLayout(page,club);

 // 1. Track builder hero
 if(want('track-builder')){
  await go(page,'builder');await closeFolders(page);await folder(page,'#measurements-folder',true);
  await page.click('#fit');const [cx,cy]=await canvasCentre(page);await wheelAt(page,cx,cy,1);
  await both(page,'track-builder');
 }

 // 2. Live preview: Tune profile tab, cars running.
 if(want('live-preview')){
  await go(page,'builder');await page.click('#fit');
  await zoomTo(page,1750,1150,3);
  await page.click('#tab-tune');await page.locator('#preset').selectOption({index:0}).catch(()=>{});
  await page.click('#play');
  await both(page,'live-preview',async()=>{
   // wait until both cars are comfortably inside the canvas view
   const box=await page.locator('#canvas').boundingBox();
   for(let i=0;i<250;i++){
    const ok=await page.evaluate(b=>{const cars=[...document.querySelectorAll('#cars > *')];if(cars.length<2)return false;return cars.every(c=>{const r=c.getBoundingClientRect();return r.width>0&&r.left>b.x+60&&r.right<b.x+b.width-60&&r.top>b.y+90&&r.bottom<b.y+b.height-110;});},box);
    if(ok)break;await page.waitForTimeout(100);
   }
  });
  await page.click('#play');await page.click('#tab-layout');
 }

 // 4. Measure & check: curvature colours, saved dimensions, lane lengths.
 if(want('measure-check')){
  await importLayout(page,clubLayout({measurements:true}));
  await go(page,'builder');await closeFolders(page);
  await folder(page,'#planning-tools',true);
  await page.click('#curvature-tool');
  await folder(page,'#measurements-folder',true);
  await page.click('#fit');
  await zoomTo(page,330,1080,4);
  await page.evaluate(()=>document.getElementById('measurements-folder').scrollIntoView({block:'center'}));
  await both(page,'measure-check');
  await page.click('#curvature-tool');await closeFolders(page);
  await importLayout(page,club);
 }

 // 5. Owned stock & shopping list
 if(want('stock-list')){
  await go(page,'builder');await folder(page,'#planning-tools',true);await page.click('#fit');
  await page.getByRole('button',{name:'Owned pieces / shopping list…'}).click();await page.waitForTimeout(500);
  await both(page,'stock-list');
  await page.keyboard.press('Escape');await closeFolders(page);
 }

 // 8. Table Designer: transport panel splits
 if(want('table-designer')){
  await go(page,'builder');
  await page.click('#space-guide-edit');await page.waitForTimeout(500);
  await page.click('#guide-base-boards');await page.waitForTimeout(800);
  await page.click('.table-designer [data-action=stock]');await page.waitForTimeout(700);
  await page.click('[data-action=suggest]');await page.waitForTimeout(800);
  await both(page,'table-designer');
  for(let i=0;i<3;i++){await page.keyboard.press('Escape');await page.waitForTimeout(200);}
  await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 }

 // Keep a copy of the club layout in the Track Library.
 await saveDesign(page,'Club Circuit');

 // 9. Export page: format choices for the club layout
 if(want('export')){
  await go(page,'export');
  await page.evaluate(()=>{const h=[...document.querySelectorAll('#export-view h2,#export-view h3')].find(e=>/Choose your track/.test(e.textContent));(h?.closest('section,.card,div')||h).scrollIntoView({block:'start'});window.scrollBy(0,-56);});
  await both(page,'export');
 }

 // 3. Track packs
 if(want('track-packs')){
  await go(page,'packs');await page.evaluate(()=>{const h=[...document.querySelectorAll('#packs-view h2')].find(e=>/Built-in/.test(e.textContent));h.scrollIntoView({block:'start'});window.scrollBy(0,-28);});
  await both(page,'track-packs');
 }

 // optional: custom piece editor (matching curve family)
 if(want('custom-piece')){
  await go(page,'custom');await page.click('#custom-create');await page.waitForTimeout(600);
  await page.fill('#piece-form [name=name]','Club R2 curve').catch(()=>{});
  await page.selectOption('#piece-form [name=type]','curve');await page.waitForTimeout(300);await page.selectOption('#piece-form [name=curveMode]','family').catch(()=>{});await page.selectOption('#piece-form [name=radiusNumber]','2').catch(()=>{});await page.fill('#piece-form [name=name]','Club R2 curve');
  await page.waitForTimeout(500);
  await both(page,'custom-piece');
  await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
 }

 // 6. Routed wood: flowing tabletop layout
 if(want('routed-track')){
  await go(page,'routed');
  await page.getByRole('button',{name:'Load flowing example'}).click();await page.waitForTimeout(900);
  if(await page.locator('#confirm-dialog[open]').count())await page.click('#confirm-go');
  await page.waitForTimeout(1200);await prep(page);
  await page.fill('#track-name','Club Circuit · Routed');await page.press('#track-name','Enter');await page.locator('#track-name').blur();
  await closeFolders(page);await folder(page,'#routed-checks-folder',true);await folder(page,'#selection-folder',false);
  await page.click('#fit');
  await both(page,'routed-track');
  await saveDesign(page,'Club Circuit · Routed');
 }

 // 7. FreeForm: drawn slot, generated lanes, point handles
 if(want('freeform')){
  // start FreeForm from the club layout (club table) rather than the routed example
  await importLayout(page,club);
  await go(page,'freeform');
  await page.click('#ff-fit');await page.waitForTimeout(400);
  // drawing surface = the largest rect inside the FreeForm view
  const t=await page.evaluate(()=>{const rs=[...document.querySelectorAll('#freeform-view svg rect')].map(r=>r.getBoundingClientRect()).filter(r=>r.width>200);rs.sort((a,b)=>b.width*b.height-a.width*a.height);const r=rs[0];return{x:r.x,y:r.y,w:r.width,h:r.height};});
  const P=(fx,fy)=>[t.x+t.w*(.5+(fx-.5)*.8),t.y+t.h*(.5+(fy-.5)*.78)];
  const pts=[[.25,.2],[.55,.18],[.8,.22],[.88,.5],[.78,.78],[.6,.72],[.45,.82],[.22,.8],[.12,.5]];
  await page.click('#ff-draw');
  for(const [fx,fy] of pts){const [x,y]=P(fx,fy);await page.mouse.click(x,y);await page.waitForTimeout(150);}
  // finish the loop (Close loop is enabled while the drawing is still open)
  await page.waitForTimeout(300);if(await page.locator('#ff-close').isEnabled())await page.click('#ff-close');
  await page.waitForTimeout(600);
  await page.fill('#ff-name','Club Circuit · FreeForm');await page.locator('#ff-name').dispatchEvent('change');
  await page.click('#ff-tab-lanes');await page.fill('#ff-count','4');await page.locator('#ff-count').dispatchEvent('change');await page.waitForTimeout(200);
  await page.locator('#ff-reference').selectOption('2');
  await page.click('#ff-generate');await page.waitForTimeout(800);
  await page.click('#ff-fit');await page.waitForTimeout(400);
  await both(page,'freeform');
  // Use it in the builder and keep it in the library too.
  await page.click('#ff-apply');await page.waitForTimeout(900);
  if(await page.locator('#confirm-dialog[open]').count())await page.click('#confirm-go');
  await page.waitForTimeout(900);
  await saveDesign(page,'Club Circuit · FreeForm');
 }

 // optional: Track Library
 if(want('track-library')){
  await go(page,'library');await page.waitForTimeout(800);
  await both(page,'track-library');
 }

 await app.evaluate(({app})=>app.exit(0)).catch(()=>{});
})().catch(async e=>{console.error(e);process.exit(1);});
