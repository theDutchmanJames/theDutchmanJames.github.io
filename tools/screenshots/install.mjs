// Copies reviewed captures from incoming-screenshots/<app>/ into public/assets/apps/<app>/<date>/,
// replaces that app's gallery in content/apps.json and records provenance in content/asset-sources.json.
// Usage: node tools/screenshots/install.mjs <App> [--remove-old]
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'../..');
const DATE='2026-11-16';
// Gallery order and labels. First entry is also the homepage showcase image.
const GALLERIES={
 Decals:[['sheet-editor','Sheet editor'],['racing-graphics','Racing graphics'],['car-preview','Car preview'],['vector-tracing','Vector tracing'],['slice-export','Slice & export'],['decal-library','Decal library'],['scale-conversion','Scale conversion']],
 Livery:[['studio','Design studio'],['decals','Decals & race numbers'],['gradients','Gradients & stripes'],['prepare','Template preparation'],['library','User Library'],['workshop','Workshop notes'],['export','Transparent PNG'],['welcome','Welcome']],
 Telemetry:[['workbench','Workbench'],['setup-analysis','Setup analysis'],['compare-setups','Compare setups'],['library','Setup library'],['lap-analysis','Lap analysis'],['progress','Progress'],['driver-feedback','Driver Feedback'],['balance','Ballast planner'],['clearance','Tyre wear & clearance']],
 Timing:[['live-race','Live race'],['race-setup','Race setup'],['results','Results'],['fuel','Fuel'],['tyre-wear','Tyre wear'],['weather','Weather'],['widget-builder','Widget Builder'],['audio-calls','Audio calls'],['race-director','Race Director'],['help','Help']],
 Circuit:[['track-builder','Track builder'],['live-preview','Live Preview'],['routed-track','Routed track'],['freeform','FreeForm'],['measure-check','Measure & check'],['table-designer','Table Designer'],['stock-list','Owned pieces & shopping'],['track-packs','Track packs'],['export','Import & export']],
};
const [name,...flags]=process.argv.slice(2);
const order=GALLERIES[name];if(!order)throw Error(`No gallery order defined for ${name}`);
const slug=name.toLowerCase(),src=path.join(root,'incoming-screenshots',slug),dest=path.join(root,'public/assets/apps',slug,DATE);
await fs.mkdir(dest,{recursive:true});
const appsFile=path.join(root,'content/apps.json'),sourcesFile=path.join(root,'content/asset-sources.json');
const data=JSON.parse(await fs.readFile(appsFile,'utf8'));
const old=data.galleries[name];
const sources=JSON.parse(await fs.readFile(sourcesFile,'utf8')).filter(s=>!s.destination.startsWith(`assets/apps/${slug}/${DATE}/`));
const gallery=[];
for(const [id,label] of order){
 const entry={label,source:'provided',capturedAt:DATE};
 for(const theme of ['light','dark']){
  const file=`${id}-${theme}.png`,bytes=await fs.readFile(path.join(src,file));
  await fs.writeFile(path.join(dest,file),bytes);
  entry[theme]=`${DATE}/${file}`;
  sources.push({source:`tools/screenshots/capture-${slug}.cjs`,destination:`assets/apps/${slug}/${DATE}/${file}`,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),provided:true});
 }
 gallery.push(entry);
}
data.galleries[name]=gallery;
const app=data.apps[name];delete app.shot;app.light=gallery[0].light;app.dark=gallery[0].dark;
await fs.writeFile(appsFile,JSON.stringify(data,null,2)+'\n');
// Drop provenance for files no longer used, and optionally delete them.
const used=new Set(gallery.flatMap(g=>[g.light,g.dark]).map(f=>`assets/apps/${slug}/${f}`));
const stale=new Set(old.flatMap(p=>[p.light,p.dark,p.file]).filter(Boolean).map(f=>`assets/apps/${slug}/${f}`).filter(f=>!used.has(f)));
await fs.writeFile(sourcesFile,JSON.stringify(sources.filter(s=>!stale.has(s.destination)),null,2)+'\n');
if(flags.includes('--remove-old'))for(const f of stale){await fs.rm(path.join(root,'public',f),{force:true});console.log('removed',f);}
console.log(`${name}: ${gallery.length} views installed, ${stale.size} old files ${flags.includes('--remove-old')?'removed':'now unused'}.`);
