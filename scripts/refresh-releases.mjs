// Refreshes content/releases.json from the latest GitHub release of each SlotForge app.
// Usage: npm run refresh:releases   (optionally set GITHUB_TOKEN to avoid the API rate limit)
// Paddock parts-list ZIPs are collected from whichever release holds them (newest first), and the
// brand list with counts is read from parts-lists/README.md in the Paddock repo, so new brands need no site edit.
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const file=path.join(root,'content/releases.json');
const current=JSON.parse(await fs.readFile(file,'utf8'));
const headers={'User-Agent':'slotforge-website','Accept':'application/vnd.github+json',...(process.env.GITHUB_TOKEN?{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`}:{})};
const get=async url=>{const r=await fetch(url,{headers});if(!r.ok)throw Error(`${r.status} ${r.statusText}: ${url}`);return r.json();};
const asset=a=>({name:a.name,url:a.browser_download_url,size:a.size});
const apps={};
for(const name of Object.keys(current.apps)){
 const repo=`theDutchmanJames/SlotForge${name}`;
 const r=await get(`https://api.github.com/repos/${repo}/releases/latest`);
 apps[name]={tag:r.tag_name,publishedAt:r.published_at,url:r.html_url,body:r.body??'',assets:r.assets.map(asset)};
 if(name==='Paddock'){
  const parts=new Map();
  for(const rel of await get(`https://api.github.com/repos/${repo}/releases?per_page=100`))
   if(!rel.draft)for(const a of rel.assets)if(/-Parts-List-.*\.zip$/i.test(a.name)&&!parts.has(a.name))parts.set(a.name,{...asset(a),release:rel.tag_name});
  apps[name].partsLists=[...parts.values()];
 }
 const old=current.apps[name]?.tag;
 console.log(`${name.padEnd(10)} ${old===r.tag_name?'unchanged':`${old} → ${r.tag_name}`}  (${r.assets.length} files)`);
}
// Brands and counts come from the table in SlotForgePaddock/parts-lists/README.md (the source of truth).
const partsFile=path.join(root,'content/parts-lists.json');
const partsData=JSON.parse(await fs.readFile(partsFile,'utf8'));
const readme=await (await fetch('https://raw.githubusercontent.com/theDutchmanJames/SlotForgePaddock/main/parts-lists/README.md',{headers})).text();
const num=v=>Number(v.replace(/[^\d]/g,''));
const rows=readme.split('\n').map(l=>l.split('|').map(c=>c.trim())).filter(c=>c.length>=8&&/\.zip\]/i.test(c[6]));
if(!rows.length)throw Error('No catalogue rows found in parts-lists/README.md; check its table.');
const catalogues=rows.map(c=>({brand:c[1],edition:c[2],file:c[6].match(/\[([^\]]+\.zip)\]/i)[1],parts:num(c[3]),supplies:num(c[4])}));
for(const c of catalogues)if(!apps.Paddock.partsLists.some(a=>a.name===c.file))throw Error(`${c.file} is listed in the README but not attached to any Paddock release yet.`);
partsData.catalogues=catalogues;partsData.edition=catalogues[0].edition;
await fs.writeFile(partsFile,JSON.stringify(partsData,null,2)+'\n');
console.log(`Parts lists: ${catalogues.map(c=>c.brand).join(', ')} (from ${apps.Paddock.partsLists[0]?.release})`);
await fs.writeFile(file,JSON.stringify({checkedAt:new Date().toISOString().slice(0,10),apps},null,2)+'\n');
console.log('Wrote content/releases.json');
