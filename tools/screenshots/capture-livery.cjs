// Gallery screenshots for SlotForge Livery. Run: node capture-livery.cjs [slug ...]
// One car in every shot, angled view only: livery-assets/car/sports-car.eps
// The car is imported through Livery's own EPS converter and labelled in its Prepare dialog.
const path=require('node:path'),fs=require('node:fs');
const {launch,shot}=require('./lib.cjs');
const LABELS=require('./livery-car-labels.cjs');
const APP='Livery',ASSETS=path.join(__dirname,'livery-assets'),CAR=path.join(ASSETS,'car/sports-car.eps');
const read=f=>fs.readFileSync(path.join(ASSETS,f),'utf8');
const only=new Set(process.argv.slice(2));
const want=slug=>!only.size||only.has(slug);
const DECALS={fnc:'decal-fnc.svg',circuit:'decal-circuit.svg',forge:'decal-forge.svg',chequer:'decal-chequer.svg',driver:'decal-driver.svg',number:'decal-number.svg'};

async function setTheme(page,theme){
 await page.evaluate(t=>{store.settings={...(store.settings||{}),theme:t};applyTheme();render();},theme);
}
async function settle(page){
 await page.evaluate(async()=>{await flushSave();const t=document.querySelector('#toast');clearTimeout(toast.timer);t.classList.remove('show');document.activeElement?.blur?.();});
 await page.mouse.move(1599,962);
 await page.waitForTimeout(700);
}
async function both(page,slug,prep){
 if(!want(slug))return;
 for(const theme of ['light','dark']){
  await setTheme(page,theme);
  if(prep)await prep(theme);
  await settle(page);
  await shot(page,APP,`${slug}-${theme}`);
 }
}

// ---------- in-page builder (runs inside the renderer) ----------
function buildProject({decals}){
 const p=project,view=p.template.views.angled;
 // Glass, lights and wheels keep their own colour and are not painted over.
 const fixed={Windows:'#26333b',Lights:'#fff3ce',Wheels:'#c5ccd0'};
 for(const r of view.regions){
  if(fixed[r.partLabel]){r.role='protected';r.colour=fixed[r.partLabel];}
  else if(r.partLabel==='Trim'){r.colour='#2b3338';r.finish='Satin';}
 }
 Object.assign(p.template,{description:'Modern GT coupe, angled view.',creator:'Friday Night Club'});
 const ti=store.templates.findIndex(t=>t.id===p.template.id);if(ti>=0)store.templates[ti]=M.clone(p.template);
 p.name='No. 27 · Friday Night Club';
 p.base='#1d5fa3';p.finish='Gloss';p.effect='Metallic';p.fillType='gradient';
 p.gradient={angle:0,strength:.85,scope:'view',stops:[{offset:0,colour:'#8fd3f4'},{offset:.3,colour:'#2f8fd0'},{offset:.62,colour:'#1d5fa3'},{offset:1,colour:'#0e2440'}]};
 p.paints='Body: metallic blue fade, sky blue nose into navy tail · 2K gloss clear\nStripes: signal orange with sunflower yellow pinstripes\nRoundel: gloss white · Number: navy · Trim: satin black';
 p.notes='1. Prime and pre-shade panel lines in navy.\n2. Lay the blue fade nose to tail, lighter towards the front.\n3. Mask the twin centre stripes over bonnet and roof; spray yellow first, then orange.\n4. Door roundels and number 27 after the first clear coat.\n5. Sponsor decals from the Friday Night Club sheet; check the bonnet decal against the angled view.';
 // Positions measured on the 1920×1280 preview of the artwork → Livery's 1000×600 view space.
 const S=.328,J=(x,y)=>({x:185+x*S,y:90+y*S});
 const O='#f28a35',Y='#f2b631',W='#f7f3e8',N='#14202b';
 const line=(name,pts,stripes,gap,extra={})=>M.lineFromPoints(pts.map(([x,y])=>J(x,y)),{name,lineStripes:stripes.map(([w,c])=>({width:w*S,colour:c})),lineGap:gap*S,lineCap:'butt',fill:O,...extra});
 const box=(kind,name,x,y,w,h,extra={})=>{const a=J(x,y);return M.layer(kind,{name,x:a.x,y:a.y,w:w*S,h:h*S,...extra});};
 const decal=(key,name,x,y,w,extra={})=>{const a=J(x,y),l=DecalArtwork.layer(decals[key],name,w*S);return Object.assign(l,{x:a.x,y:a.y},extra);};
 // Catmull-Rom spline through the control points, so the stripe bends smoothly from bumper to bonnet.
 const smooth=(c,n=10)=>{const out=[];const P=i=>c[Math.max(0,Math.min(c.length-1,i))];for(let i=0;i<c.length-1;i++)for(let k=0;k<n;k++){const t=k/n,[p0,p1,p2,p3]=[P(i-1),P(i),P(i+1),P(i+2)];out.push([0,1].map(d=>.5*((2*p1[d])+(-p0[d]+p2[d])*t+(2*p0[d]-5*p1[d]+4*p2[d]-p3[d])*t*t+(-p0[d]+3*p1[d]-3*p2[d]+p3[d])*t*t*t)));}out.push(c[c.length-1]);return out;};
 const centre=smooth([[505,905],[482,805],[478,735],[530,662],[650,575],[860,458],[1010,300],[1300,288],[1500,335],[1640,385]]);
 p.views.angled=[
  line('Twin centre stripes',centre,[[44,O],[44,O]],30),
  line('Yellow pinstripes',centre,[[9,Y],[9,Y]],136),
  line('Side stripe',[[1262,738],[1612,650]],[[9,Y],[30,O],[9,Y]],6),
  box('ellipse','Door roundel',1372,520,118,150,{fill:W}),
  box('text','Race number 27',1386,552,92,88,{text:'27',font:'Arial',fill:N}),
  decal('fnc','Friday Night Club badge',1050,488,165,{skewY:-12}),
  decal('forge','SlotForge sponsor',905,500,160,{skewY:-12})
 ];
 // User Library: decals from the club sheet plus reusable stripes and shapes.
 const asset=(l,name,description)=>({id:M.uid(),name,type:'shape',layer:{...M.clone(l),name},description});
 const dl=(key,name)=>DecalArtwork.layer(decals[key],name,180);
 const L=p.views.angled,find=n=>L.find(l=>l.name===n);
 store.assets.push(
  asset(dl('fnc','Friday Night Club badge'),'Friday Night Club badge','Imported from Friday Night Club sheet'),
  asset(dl('circuit','Club Circuit sponsor'),'Club Circuit sponsor','Imported from Friday Night Club sheet'),
  asset(dl('forge','SlotForge sponsor'),'SlotForge sponsor','Imported from Friday Night Club sheet'),
  asset(dl('chequer','Chequered flag'),'Chequered flag','Imported from Friday Night Club sheet'),
  asset(dl('driver','Driver names · Alex & Jamie'),'Driver names · Alex & Jamie','Imported from Friday Night Club sheet'),
  asset(dl('number','Number 27 roundel'),'Number 27 roundel','Imported from Friday Night Club sheet'),
  asset(find('Side stripe'),'Triple racing stripe · orange'),
  asset(find('Twin centre stripes'),'Twin centre stripes'),
  asset(M.layer('polygon',{fill:'#f28a35',w:160,h:120,points:[{x:.45,y:0},{x:1,y:.12},{x:1,y:1},{x:0,y:1}]}),'Nose sweep'),
  asset(M.layer('polygon',{fill:'#f2b631',w:160,h:90,points:[{x:0,y:0},{x:.65,y:0},{x:1,y:.5},{x:.65,y:1},{x:0,y:1},{x:.35,y:.5}]}),'Chevron · sunflower'),
  asset(M.layer('polygon',{fill:'#d8343c',w:220,h:90,points:[{x:.3,y:0},{x:1,y:0},{x:.7,y:1},{x:0,y:1}]}),'Diagonal band · red'),
  M.groupAsset(M.clone([find('Door roundel'),find('Race number 27')]),'Race number set · 27')
 );
 const variant=(name,base,stops)=>M.liveryFromProject({...p,base,gradient:{...p.gradient,stops:stops.map((c,i)=>({offset:i/(stops.length-1),colour:c}))}},name);
 store.liveries.push(M.liveryFromProject(p,'No. 27 · Friday Night Club'),variant('No. 14 · Sunset Orange','#f28a35',['#ffd36a','#f28a35','#7a2412']),variant('No. 8 · Midnight Green','#1f6b55',['#69c6ad','#1f6b55','#0b2a22']));
 store.projects=[p];
 setProject(p);currentView='angled';preparing=false;tool='select';selected=null;selectedPaint=null;multiSelected.clear();multiPaintSelected.clear();
 store.settings={...store.settings,paintPreview:true};render();
 return p.id;
}

(async()=>{
 const {app,page}=await launch(APP);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.waitForSelector('#tools button');await page.waitForTimeout(800);
  // Capture-only cosmetic: the inspector's property area overflows by ~2px at this window size.
  await page.addStyleTag({content:'.property-scroll{overflow-x:hidden!important}'});

  await both(page,'welcome');

  // Import the car through the app's own EPS import, then label its areas in the Prepare dialog.
  await page.locator('[data-action="add-car"]').first().click();
  await page.locator('#car-name').fill('Club GT racer');
  await page.locator('#car-view').selectOption('angled');
  await page.locator('#choose-svg').click({noWaitAfter:true});
  await page.locator('#car-file').setInputFiles(CAR);
  await page.waitForSelector('#repair-preview [data-repair-area]',{timeout:60000});
  const num=await page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('[data-repair-check]')].map(c=>[c.closest('label,div,li').textContent.match(/Area (\d+)/)?.[1],c.dataset.repairCheck])));
  const used=new Set(Object.values(LABELS).flat());
  const groups={Bodywork:Object.keys(num).map(Number).filter(n=>!used.has(n)),...LABELS};
  const pick=async list=>{for(const n of list)if(num[n])await page.locator(`[data-repair-check="${num[n]}"]`).check();};
  for(const name of ['Bodywork','Windows','Lights','Wheels']){await pick(groups[name]);await page.locator('#panel-label').click();await page.locator(`[data-part-label="${name}"]`).click();}
  // Leave the trim selected with the label menu open: the next step the user would take.
  await pick(groups.Trim);
  const openMenu=async()=>{if(!await page.locator('[data-part-label="Trim"]').isVisible())await page.locator('#panel-label').click();};
  await openMenu();
  await both(page,'prepare',openMenu);
  await openMenu();await page.locator('[data-part-label="Trim"]').click();
  await page.getByRole('button',{name:'Save preparation'}).click();
  await page.waitForTimeout(800);

  const decals=Object.fromEntries(Object.entries(DECALS).map(([k,f])=>[k,read(f)]));
  await page.evaluate(buildProject,{decals});
  await page.waitForTimeout(500);

  // Zoom the canvas to the car (the EPS artboard has generous margins).
  const show=async fn=>page.evaluate(fn=>{currentView='angled';preparing=false;tool='select';selected=null;selectedPaint=null;multiSelected.clear();multiPaintSelected.clear();(new Function(fn))();render();viewBox={x:205,y:150,w:590,h:292};renderCanvas();},fn||'');
  const rezoom=()=>page.evaluate(()=>{viewBox={x:205,y:150,w:590,h:292};renderCanvas();});

  await show("selected=layers().find(l=>l.name==='Twin centre stripes').id;");
  await both(page,'studio',async()=>{await rezoom();await page.evaluate(()=>{for(const d of document.querySelectorAll('#inspector details')){const t=d.querySelector('summary')?.textContent||'';if(/Line & stripes/.test(t))d.open=true;if(/Colour & gradient|Fit to angled/.test(t))d.open=false;}});});

  await show("selected=layers().find(l=>l.name==='Friday Night Club badge').id;fitPanelOpen=true;");
  await both(page,'decals',async()=>{await rezoom();await page.evaluate(()=>{const d=document.querySelector('.fit-controls');if(d&&!d.open)d.open=true;});await page.waitForTimeout(200);await page.evaluate(()=>{document.querySelector('#fit-skewX')?.scrollIntoView({block:'center'});});});

  await show("selectPaint('g:Bodywork');");
  await both(page,'gradients',async()=>{await rezoom();await page.evaluate(()=>{for(const d of document.querySelectorAll('#inspector details'))if(/Colour & gradient/.test(d.querySelector('summary')?.textContent||''))d.open=true;});await page.waitForTimeout(200);await page.evaluate(()=>{const g=document.querySelector('.gradient-controls');if(!g)return;g.scrollIntoView({block:'start'});let n=g.parentElement;while(n&&n.scrollHeight<=n.clientHeight+1)n=n.parentElement;if(n)n.scrollTop-=70;});});

  await show();
  await both(page,'library',async()=>{await page.evaluate(()=>openLibrary('assets'));await page.waitForTimeout(400);});
  await page.evaluate(()=>closeDialog());
  await show();
  await both(page,'workshop',async()=>{await page.evaluate(()=>notesDialog());});
  await page.evaluate(()=>closeDialog());
  await show();
  await both(page,'export',async()=>{await page.evaluate(()=>{if(!document.querySelector('#dialog').open||!document.querySelector('#png-preview'))exportPNGDialog();});await page.waitForFunction(()=>!document.querySelector('#png-save').disabled);});
  await page.evaluate(()=>closeDialog());
  if(errors.length)console.log('page errors:',errors);
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exit(1);});
