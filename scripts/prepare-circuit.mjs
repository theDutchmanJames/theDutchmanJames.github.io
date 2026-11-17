// Turns the Circuit release source into the browser-only copy at public/circuit/online.
// Usage: download the release's source (github.com/theDutchmanJames/SlotForgeCircuit, tag zip) and unpack it to
// .cache/circuit-<tag>-src/, then run: node scripts/prepare-circuit.mjs   (the tag comes from content/releases.json)
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const tag=process.argv[2]??JSON.parse(await fs.readFile(path.join(root,'content/releases.json'),'utf8')).apps.Circuit.tag;
const unpacked=path.join(root,`.cache/circuit-${tag}-src`);
const [folder]=(await fs.readdir(unpacked,{withFileTypes:true})).filter(d=>d.isDirectory());
if(!folder)throw Error(`No unpacked Circuit source in ${unpacked}`);
const source=path.join(unpacked,folder.name);
const target=path.join(root,'public/circuit/online');
await fs.rm(target,{recursive:true,force:true});
await fs.mkdir(target,{recursive:true});
for(const dir of ['app','designs','track-packs'])await fs.cp(path.join(source,dir),path.join(target,dir),{recursive:true});
for(const file of ['LICENSE','THIRD-PARTY-NOTICES.txt'])await fs.copyFile(path.join(source,file),path.join(target,file));
const storage=path.join(target,'app/local-workspace.js');
let storageCode=await fs.readFile(storage,'utf8');
const expected=/async function init\(\)\s*\{/;
if(!expected.test(storageCode))throw Error('Circuit storage adapter changed; review before preparing a browser build.');
storageCode=storageCode.replace(expected,m=>m+'if(root.SLOTFORGE_BROWSER_ONLY===true)return;');
await fs.writeFile(storage,storageCode);
const index=path.join(target,'app/index.html');
let html=await fs.readFile(index,'utf8');
for(const marker of ['<head>','<footer class="statusbar">'])if(!html.includes(marker))throw Error(`Circuit index.html no longer contains ${marker}; review before preparing a browser build.`);
html=html.replace('<head>','<head><script src="host-mode.js"></script>');
html=html.replace('<footer class="statusbar">','<footer class="statusbar"><a href="../" style="margin-right:12px">← Circuit website</a>');
await fs.writeFile(index,html);
await fs.writeFile(path.join(target,'app/host-mode.js'),'// Browser-only hosting adapter; preserves Circuit’s built-in browser persistence.\nglobalThis.SLOTFORGE_BROWSER_ONLY=true;\n');
await fs.writeFile(path.join(target,'HOSTING-NOTES.txt'),`SlotForge Circuit browser edition\nBased on official release ${tag}:\nhttps://github.com/theDutchmanJames/SlotForgeCircuit/releases/tag/${tag}\n\nWebsite adaptation on ${new Date().toISOString().slice(0,10)}:\n- Retained the app, designs and track-packs static directories.\n- Added host-mode.js and a guard in LocalWorkspace.init to select the existing browser mode without probing a local disk service.\n- Added a return link to the Circuit website in the status bar.\n- Retained the original licence and third-party notices.\n\nNo local helper, installation scripts, server or user data are hosted.\nBrowser and installed workspaces remain separate. Export workspace backups before clearing site data or changing browser origins.\n`);
console.log(`Prepared Circuit ${tag} for browser-only static hosting.`);
