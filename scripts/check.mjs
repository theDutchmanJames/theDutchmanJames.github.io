import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..'),dist=path.join(root,'dist');
const data=JSON.parse(await fs.readFile(path.join(root,'content/apps.json'),'utf8'));
const releases=JSON.parse(await fs.readFile(path.join(root,'content/releases.json'),'utf8'));
const pages=['index.html','about/index.html','library/index.html','circuit/online/index.html',...Object.keys(data.apps).map(n=>n.toLowerCase()+'/index.html')];
let checks=0;
for(const file of pages){
 const text=await fs.readFile(path.join(dist,file),'utf8');
 assert.match(text,/<title>[^<]+<\/title>/);assert.match(text,/<meta name="description"/);assert.match(text,/<html lang="en"/);
 const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`Duplicate ids in ${file}`);
 for(const [,value] of text.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(?:https?:|data:|mailto:)/.test(value))continue;
  const decoded=value.replaceAll('&amp;','&');const [withQuery,anchor]=decoded.split('#');const relative=withQuery.split('?')[0];
  let destination=path.resolve(path.dirname(path.join(dist,file)),relative||'.');
  if(!relative)destination=path.join(dist,file);
  const stat=await fs.stat(destination).catch(()=>null);assert(stat,`${file}: missing ${value}`);
  if(stat.isDirectory())destination=path.join(destination,'index.html');
  await fs.access(destination);checks++;
  if(anchor&&destination.endsWith('.html')){const target=await fs.readFile(destination,'utf8');assert(target.includes(`id="${anchor}"`),`${file}: missing anchor ${value}`);}
 }
 if(file.includes('/index')&&Object.keys(data.apps).some(n=>file===n.toLowerCase()+'/index.html')){
  const n=Object.keys(data.apps).find(n=>file.startsWith(n.toLowerCase()+'/'));
  for(const [,features] of data.featureGroups[n])for(const [title] of features)assert(text.includes(title.replaceAll('&','&amp;')),`${n}: missing feature ${title}`);
  for(const asset of [...text.matchAll(/href="(https:\/\/github.com\/[^" ]+\/releases\/download\/[^" ]+)"/g)].map(m=>m[1]))assert([...releases.apps[n].assets,...(releases.apps[n].partsLists??[])].some(a=>a.url===asset),`Unverified ${n} download ${asset}`);
  if(n!=='Circuit')assert(!text.includes('Discover Circuit')&&!text.includes('Use Circuit online'),`${n}: unrelated Circuit navigation`);
 }
}
for(const [name,pictures] of Object.entries(data.galleries))for(const picture of pictures)for(const file of new Set([picture.light,picture.dark,picture.file].filter(Boolean)))await fs.access(path.join(dist,'assets/apps',name.toLowerCase(),file));
const appHtml=await fs.readFile(path.join(dist,'circuit/online/app/index.html'),'utf8');
for(const [,source] of appHtml.matchAll(/(?:src|href)="([^"]+)"/g)){
 if(/^(?:https?:|data:|#)/.test(source))continue;
 const pathname=source.split('#')[0];if(!pathname)continue;
 await fs.access(path.resolve(dist,'circuit/online/app',pathname));checks++;
}
assert.match(await fs.readFile(path.join(dist,'circuit/online/app/local-workspace.js'),'utf8'),/SLOTFORGE_BROWSER_ONLY/);
console.log(`Passed: ${pages.length} website pages, ${checks} local references, ${Object.keys(data.apps).length} feature sets and verified release URLs, gallery assets, Circuit entry assets and browser-mode adapter.`);
