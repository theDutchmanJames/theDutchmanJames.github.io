import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const data=JSON.parse(await fs.readFile(path.join(root,'content/apps.json'),'utf8'));
const items=[];
for(const [name,app] of Object.entries(data.apps)){
 const slug=name.toLowerCase();
 const add=(source,destination)=>items.push({source:`https://raw.githubusercontent.com/theDutchmanJames/SlotForge${name}/${app.sha}/${source}`,destination});
 add(app.icon,`assets/apps/${slug}/icon${path.extname(app.icon)}`);
 for(const picture of data.galleries[name]){
  if(picture.source==='provided')continue;
  for(const file of new Set([picture.light,picture.dark,picture.file].filter(Boolean)))add(`docs/screenshots/${file}`,`assets/apps/${slug}/${file}`);
 }
 if(name==='Paddock')for(const mode of ['light','dark'])add(`assets/slotforge-wordmark-${mode}.svg`,`assets/brand/slotforge-${mode}.svg`);
}
let next=0,downloaded=0;
await Promise.all(Array.from({length:6},async()=>{
 while(next<items.length){const item=items[next++],dest=path.join(root,'public',item.destination);try{if((await fs.stat(dest)).size>0)continue;}catch{}
  const response=await fetch(item.source);if(!response.ok)throw Error(`${response.status}: ${item.source}`);
  const bytes=new Uint8Array(await response.arrayBuffer());if(!bytes.length)throw Error(`Empty image: ${item.source}`);
  await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,bytes);downloaded++;
 }
}));
const supplied=JSON.parse(await fs.readFile(path.join(root,'content/asset-sources.json'),'utf8')).filter(item=>item.provided);
for(const item of supplied)await fs.access(path.join(root,'public',item.destination));
await fs.writeFile(path.join(root,'content/asset-sources.json'),JSON.stringify([...items,...supplied],null,2)+'\n');
console.log(`Assets ready: ${items.length} references, ${downloaded} downloaded.`);
