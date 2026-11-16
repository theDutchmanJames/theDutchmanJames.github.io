// Gallery screenshots for SlotForge Decals. Run: node capture-decals.cjs
// Everything runs in a throwaway profile (lib.launch); demo data is built through the
// app's own renderer functions (DM, Creation, ShapeTools, Art, Library, mutate, …).
const path=require('node:path'),fs=require('node:fs');
const {launch,shot}=require('./lib.cjs');
const APP='Decals';
const ONLY=process.argv[2]?new Set(process.argv[2].split(',')):null;

async function themed(page,slug,prep){
 for(const theme of ['light','dark']){
  await page.evaluate(t=>setTheme(t),theme);
  if(prep)await prep(theme);
  await settle(page);
  if(!ONLY||ONLY.has(slug))await shot(page,APP,`${slug}-${theme}`);
 }
}
async function settle(page){
 await page.evaluate(()=>{const t=document.querySelector('#toast');if(t){t.textContent='';t.className='';t.style.visibility='hidden';}document.activeElement?.blur?.();});
 await page.mouse.move(1599,962);
 await page.waitForTimeout(700);
}

// Raster club logo for the tracing view (drawn in the renderer, saved as a PNG file).
async function makeLogo(page,file){
 const b64=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=900;c.height=900;const x=c.getContext('2d');
  x.fillStyle='#ffffff';x.fillRect(0,0,900,900);
  x.fillStyle='#e21e32';x.beginPath();x.arc(450,450,400,0,Math.PI*2);x.fill();
  x.fillStyle='#161b22';x.beginPath();x.arc(450,450,330,0,Math.PI*2);x.fill();
  // chequered flag band
  x.save();x.beginPath();x.arc(450,450,330,0,Math.PI*2);x.clip();
  const s=46;for(let r=0;r<3;r++)for(let col=0;col<16;col++){x.fillStyle=(r+col)%2?'#161b22':'#ffffff';x.fillRect(80+col*s,560+r*s,s,s);}x.restore();
  x.fillStyle='#ffffff';x.font='italic 900 250px Arial';x.textAlign='center';x.textBaseline='alphabetic';x.fillText('FNC',450,500);
  x.fillStyle='#ffd200';x.fillRect(250,520,400,18);
  // ring lettering
  x.fillStyle='#ffffff';x.font='bold 54px Arial';
  const ring=(text,start,dir)=>{const step=dir*0.105;let a=start-step*(text.length-1)/2;for(const ch of text){x.save();x.translate(450+Math.cos(a)*365,450+Math.sin(a)*365);x.rotate(a+dir*Math.PI/2);x.fillText(ch,0,18);x.restore();a+=step;}};
  ring('FRIDAY NIGHT',-Math.PI/2,1);ring('SLOT CLUB',Math.PI/2,-1);
  x.fillStyle='#ffd200';for(const a of [Math.PI,0]){x.beginPath();x.arc(450+Math.cos(a)*365,450,14,0,Math.PI*2);x.fill();}
  return c.toDataURL('image/png').split(',')[1];});
 fs.writeFileSync(file,Buffer.from(b64,'base64'));
}

// The hero sheet: lettering, numbers, plates, chequers, stripes, names and shapes.
async function buildSheet(page){
 return page.evaluate(()=>{
  const red='#e21e32',ink='#161b22',yellow='#ffd200',blue='#184a9e',orange='#ff5c35',white='#ffffff';
  const svgAsset=(name,content,w,h)=>DM.item('svg',{name,svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${content}</svg>`,w,h});
  const measure=i=>Art.textBox(i);
  const num=(style,w,h,o={})=>Creation.numberTemplate({style,text:'27',w,h,border:o.border??1.2,background:o.bg??white,outline:o.outline??red,foreground:o.fg??ink,font:'Arial',bold:true},measure);
  const text=(name,t,h,o={})=>{const i=DM.item('text',{name,text:t,font:'Arial',bold:true,italic:!!o.italic,fill:o.fill||ink,h,w:h,spacing:o.spacing||0});i.textBounds=Art.textBox(i);i.w=h*i.textBounds.w/i.textBounds.h;if(o.curve)Art.bendText(i,o.curve);return i;};
  const forge=()=>svgAsset('Forge Racing',`<path d="M1 7H35L33 9H0Z" fill="${red}"/><text x="1" y="6.3" font-family="Arial" font-style="italic" font-weight="900" font-size="8">FORGE</text><text x="8" y="13" font-family="Arial" font-style="italic" font-weight="700" font-size="5">RACING</text>`,36,14);
  const dutch=()=>svgAsset('Dutch Motorsport',`<text x="0" y="6" font-family="Arial" font-style="italic" font-weight="900" font-size="7">DUTCH</text><path d="M25 2h12v2H25zm0 3h10v2H25z" fill="${orange}"/><text x="0" y="11" font-family="Arial" font-style="italic" font-weight="700" font-size="4.8">MOTORSPORT</text>`,38,12);
  const driver=n=>svgAsset('Driver · '+n,`<path d="M0 0h5v1.2H0" fill="#d51e35"/><path d="M0 1.2h5v1.2H0" fill="#fff" stroke="#ccc" stroke-width=".1"/><path d="M0 2.4h5v1.2H0" fill="#19488c"/><text x="7" y="3" font-family="Arial" font-weight="700" font-size="3">${n.toUpperCase()}</text>`,30,4);
  const shield=()=>{const s=svgAsset('SF Shield',`<path d="M1 1L11 0l10 1v12L11 21 1 13Z" fill="#222831" stroke="#dc2438" stroke-width="1"/><text x="4" y="13" font-family="Arial" font-size="10" font-weight="700" fill="#fff">SF</text>`,22,22);s.w=s.h=12;return s;};
  const fnc=()=>svgAsset('Club Circuit banner',`<rect x="0" y="0" width="60" height="9" rx="1.2" fill="${ink}"/><rect x="0" y="9" width="60" height="1.4" fill="${yellow}"/><text x="30" y="6.6" text-anchor="middle" font-family="Arial" font-weight="900" font-style="italic" font-size="5.6" fill="#fff">CLUB CIRCUIT</text>`,60,10.4);
  const checker=(cols,rows,sq,a=ink,b=white)=>ShapeTools.create('checkerboard',{columns:cols,rows,squareSize:sq,fill:a,fill2:b});
  const stripes=(w,widths,gap,a,b)=>ShapeTools.create('stripes',{w,count:widths.length,widths,stripeWidth:widths[0],gapMm:gap,fill:a,fill2:b});
  const shape=(t,w,h,o={})=>ShapeTools.create(t,{w,h,...o});
  const P=[];const put=(i,x,y,page=0,extra={})=>{i.id=DM.uid();i.x=x;i.y=y;i.page=page;Object.assign(i,extra);P.push(i);return i;};
  // Row 1 — hero numbers
  const hero=put(num('roundel',36,36,{border:1.8}),14,12);hero.name='Roundel 27';
  put(num('plate',44,30,{bg:yellow,outline:ink,border:1.4}),58,15).name='Number plate 27';
  put(num('oval',40,28,{bg:white,outline:blue,border:1.6,fg:blue}),110,16).name='Oval plate 27';
  // traced logo placeholder slot at 158,10 (filled by caller)
  // Row 2 — curved lettering + sponsors
  const arch=put(text('Curved lettering','FRIDAY NIGHT CLUB',7,{italic:true,curve:120,fill:red}),14,56);
  put(forge(),118,58);put(forge(),160,58);
  // Row 3 — chequers and stripes
  put(checker(14,2,4),14,82);put(checker(14,2,4),76,82);put(stripes(56,[2.4,1.4,2.4],1,red,blue),140,82);
  // Row 4 — door roundels and sponsors
  const door=[];for(let n=0;n<4;n++)door.push(put(num('roundel',18,18,{border:1.2}),15+n*25,99));door.forEach(d=>d.name='Roundel 27 · door');
  put(dutch(),118,102);put(dutch(),160,102);
  // Row 5 — driver names
  ['Alex','Jamie','Morgan','Sam'].forEach((n,k)=>put(driver(n),14+k*46,126));
  // Row 6 — stripes and shields
  put(DM.item('stripe',{name:'Racing stripe',w:70,h:5,fill:orange,fill2:blue}),14,138);put(DM.item('stripe',{name:'Racing stripe',w:70,h:5,fill:orange,fill2:blue}),90,138);
  put(shield(),166,135);put(shield(),182,135);
  // Row 7 — banner, bent-down lettering, shapes
  put(fnc(),14,152);
  put(text('Curved lettering','CLUB CIRCUIT',6,{curve:-90,fill:blue}),84,151);
  put(shape('star',12,12,{fill:yellow,stroke:ink,strokeWidth:.4}),150,152);
  put(shape('chevron',14,10,{fill:red}),167,153);put(shape('chevron',14,10,{fill:red}),185,153);
  // Row 8 — small numbers and nose plates
  for(let n=0;n<6;n++)put(num('roundel',13,13,{border:.9}),14+n*17,172).name='Roundel 27 · small';
  put(num('plate',26,18,{bg:yellow,outline:ink,border:1}),120,170).name='Nose plate 27';
  put(num('plate',26,18,{bg:white,outline:red,border:1}),152,170).name='Nose plate 27';
  // Row 9 — long chequer + stripes
  put(checker(20,2,4.5,ink,white),14,196);put(stripes(78,[3,1.5,3],1.2,blue,orange),118,195);
  // Row 10 — arrows, numbers in text, shields
  put(shape('arrow',30,10,{fill:ink}),14,212);put(shape('arrow',30,10,{fill:ink}),50,212);
  put(text('Race number','27',14,{italic:true,fill:red}),90,210);put(text('Race number','27',14,{italic:true,fill:blue}),118,210);
  put(shape('diamond',12,12,{fill:blue}),148,211);put(shape('shield',12,14,{fill:red}),166,210);put(shape('polygon',12,12,{fill:yellow,count:6}),184,211);
  // Row 11–13 — more lettering, long stripe, spares
  put(text('Club lettering','FRIDAY NIGHT CLUB',6,{italic:true}),14,230);put(checker(12,2,3),104,230);put(shield(),150,227);put(shield(),168,227);put(shape('star',12,12,{fill:red}),186,227);
  put(stripes(182,[2,1,2],.8,red,ink),14,248);
  for(let n=0;n<6;n++)put(num('roundel',13,13,{border:.9,outline:blue,fg:blue}),14+n*17,262).name='Roundel 27 · small blue';
  put(num('plate',26,18,{bg:ink,outline:yellow,border:1,fg:yellow}),120,260).name='Nose plate 27 · black';
  put(num('plate',26,18,{bg:yellow,outline:red,border:1}),152,260).name='Nose plate 27';
  // Page 2: spares
  for(let n=0;n<4;n++)put(num('roundel',30,30,{border:1.5}),14+n*44,14,1).name='Roundel 27 · spare';
  for(let n=0;n<4;n++)put(forge(),14+n*44,52,1);
  return {heroId:hero.id,archId:arch.id,doorId:door[0].id,items:P.map(i=>DM.validateItem(i))};
 });
}

(async()=>{
 const {app,page,profile}=await launch(APP);
 const exports=path.join(profile,'exports');
 await app.evaluate((_,dir)=>{process.env.SLOTFORGE_EXPORT_DIR=dir;},exports);
 page.on('pageerror',e=>console.log('PAGEERROR',e.message));
 await page.waitForSelector('#dialog [data-action="demo"]',{timeout:30000});
 // Example sheet seeds the starter library; then we replace the sheet contents.
 await page.locator('#dialog [data-action="demo"]').click();
 await page.waitForFunction(()=>Studio.project.items.length>0&&!document.querySelector('#dialog').open);

 // ── Vector tracing: import a raster club logo through the real file input, then trace it.
 const logo=path.join(profile,'Friday Night Club logo.png');await makeLogo(page,logo);
 await page.evaluate(()=>{mutate(()=>{project.items=[];project.name='Friday Night Club • No. 27';});selected=new Set();render();});
 await page.locator('#art-file').setInputFiles(logo);
 await page.locator('#import-width').waitFor();await page.locator('#import-width').fill('40');await page.locator('#place-import').click();
 await page.waitForFunction(()=>Studio.project.items.length===1);
 await page.evaluate(()=>{const i=project.items[0];i.name='Friday Night Club logo';Studio.select([i.id]);});
 await page.locator('[data-action="trace"]').first().click();
 await page.waitForFunction(()=>!document.querySelector('#trace-apply').disabled,{},{timeout:60000});
 await page.locator('#trace-colors').fill('4');await page.locator('#trace-white').check();await page.locator('#trace-update').click();
 await page.waitForFunction(()=>!document.querySelector('#trace-apply').disabled,{},{timeout:60000});
 await page.addStyleTag({content:'.trace-viewport{scrollbar-width:none}.trace-viewport::-webkit-scrollbar{display:none}'});
 await page.evaluate(()=>{for(const el of document.querySelectorAll('#dialog, #dialog *'))if(el.scrollTop)el.scrollTop=0;});
 await themed(page,'vector-tracing');
 await page.locator('#trace-apply').click();
 await page.waitForFunction(()=>Studio.project.items[0].kind==='svg');
 const traced=await page.evaluate(()=>DM.clone(project.items[0]));

 // ── Hero sheet
 const built=await buildSheet(page);
 await page.evaluate(({built,traced})=>{
  const logo={...traced,x:158,y:10,page:0};
  mutate(()=>{project.items=[...built.items.slice(0,3),logo,...built.items.slice(3)];project.pages=2;project.margin=5;project.gap=3;});
  page=0;
 },{built,traced});

 // Library: save a broad set of decals (same art as the sheet) through the app's library API.
 await page.evaluate(async()=>{
  const seen=new Set(),add=[];
  for(const i of project.items){if(seen.has(i.name)||i.page)continue;seen.add(i.name);add.push({id:DM.uid(),name:i.name.replace('Driver · ','Driver name · '),tags:'Friday Night Club',scale:32,art:DM.clone(i)});}
  add.reverse();for(const a of add){await Library.import([a],[]);await new Promise(r=>setTimeout(r,15));}
 });

 // ── Sheet editor: full A4, layers open, rulers
 await page.evaluate(id=>{settings.sidebarLibraryOpen=false;document.querySelector('#sidebar-library').open=false;document.querySelector('.left-sidebar details.slate').open=true;zoom=0;Studio.select([id]);document.querySelector('.right-sidebar').scrollTop=0;},built.heroId);
 console.log('warnings',await page.evaluate(()=>JSON.stringify(DM.warnings(project))));
 await themed(page,'sheet-editor');

 // ── Racing graphics: curved lettering selected, zoomed into the sheet
 await page.evaluate(id=>{document.querySelector('#sidebar-library').open=true;settings.sidebarLibraryOpen=true;document.querySelector('.left-sidebar details.slate').open=false;Studio.select([id]);},built.archId);
 await page.locator('[data-action="zoom-in"]').click();await page.locator('[data-action="zoom-in"]').click();await page.locator('[data-action="zoom-in"]').click();
 await page.evaluate(()=>{const s=document.querySelector('#sheet-scroll');s.scrollTop=0;s.scrollLeft=0;for(const d of document.querySelectorAll('#inspector details')){const t=d.querySelector('summary')?.textContent||'';if(/Text/.test(t))d.open=true;if(/Size/.test(t))d.open=false;}document.querySelector('.right-sidebar').scrollTop=0;});
 await themed(page,'racing-graphics');
 await page.locator('#zoom').click();

 // ── Car preview
 await page.evaluate(id=>Studio.select([id]),built.doorId);
 await page.locator('[data-action="expand-car"]').click();await page.waitForTimeout(800);
 await themed(page,'car-preview');
 await page.evaluate(()=>closeDialog());

 // ── Decal library
 await page.locator('nav [data-action="library"]').click();await page.waitForTimeout(1500);
 await page.locator('#dialog .collection-item input[type=checkbox]').nth(0).check().catch(e=>console.log('nocheck',e.message));await page.locator('#dialog .collection-item input[type=checkbox]').nth(1).check().catch(()=>{});
 await themed(page,'decal-library');
 await page.evaluate(()=>closeDialog());

 // ── Slice & export (white ink on clear paper)
 await page.evaluate(()=>{mutate(()=>{project.whiteInk=true;project.paper='clear';});Studio.select([]);});
 await page.locator('[data-action="slice"]').click();
 await page.locator('#slice-h').fill('72');await page.locator('#slice-h').dispatchEvent('change');await page.locator('#slice-boundary').selectOption('whole');
 await themed(page,'slice-export');
 await page.evaluate(()=>closeDialog());

 // ── Scale conversion 1:32 → 1:24
 await page.evaluate(()=>{Studio.select([]);scaleDialog(24);document.querySelector('#rescale-art').checked=true;});
 await themed(page,'scale-conversion');
 await page.evaluate(()=>closeDialog());

 await page.evaluate(()=>Studio.flush());
 await app.close();
})().catch(e=>{console.error(e);process.exit(1)});
