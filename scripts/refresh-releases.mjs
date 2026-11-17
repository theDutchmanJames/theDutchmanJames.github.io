// Refreshes content/releases.json from the latest GitHub release of each SlotForge app.
// Usage: npm run refresh:releases   (optionally set GITHUB_TOKEN to avoid the API rate limit)
// Paddock parts-list ZIPs are collected from whichever release holds them (newest first),
// so the parts lists keep working when a newer Paddock release doesn't re-attach them.
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
await fs.writeFile(file,JSON.stringify({checkedAt:new Date().toISOString().slice(0,10),apps},null,2)+'\n');
console.log('Wrote content/releases.json');
