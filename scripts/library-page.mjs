// Community library page. The list itself is read live from the SlotForgeLibrary repository by
// assets/library.js; sharing goes through the submit Worker when content/library-config.json
// names one, otherwise through the GitHub form.
import {readFileSync} from 'node:fs';
import path from 'node:path';

export const LIBRARY_REPO='https://github.com/theDutchmanJames/SlotForgeLibrary';
const BASE=process.env.LIBRARY_BASE||'https://raw.githubusercontent.com/theDutchmanJames/SlotForgeLibrary/main/';
const GITHUB_FORM=LIBRARY_REPO+'/issues/new?template=submit-item.yml';

const KINDS=[['all','All'],['track','Tracks'],['chassis','Chassis'],['body','Bodies'],['building','Buildings'],['livery','Liveries'],['decals','Decal sheets'],['race-screen','Race-screen packs']];
const SINGLE={track:'Track',chassis:'Chassis',body:'Body',building:'Building',livery:'Livery',decals:'Decal sheet','race-screen':'Race-screen pack'};
const APPS=['Circuit','Foundry','Anvil','Frame','Livery','Decals','Timing'];

export function libraryPage({root,shell,esc,external,assetVersion}){
 const cfg=JSON.parse(readFileSync(path.join(root,'content/library-config.json'),'utf8'));
 const submitUrl=process.env.LIBRARY_SUBMIT_URL??cfg.submitUrl, siteKey=process.env.TURNSTILE_SITEKEY??cfg.turnstileSiteKey;
 const canSubmit=Boolean(submitUrl&&siteKey);
 const appOptions=APPS.map(a=>`<option value="${a}">${a}</option>`).join('')+'<option value="STL">Any 3D printer</option>';
 const share=label=>canSubmit?`<a class="sf-action sf-primary" href="#share" data-share>${label}</a>`:external(GITHUB_FORM,label+' ↗','sf-action sf-primary');
 const field=(id,label,control,hint='')=>`<div class="lib-field"><label for="${id}">${label}</label>${control}${hint?`<small>${hint}</small>`:''}</div>`;
 const choose=(id,name,options)=>`<select id="${id}" name="${name}" required><option value="">Choose…</option>${options}</select>`;

 const form=!canSubmit?'':`<section class="lib-share" id="share" hidden aria-labelledby="share-title">
<div class="lib-share-head"><div><div class="sf-kicker">Share with the community</div><h2 id="share-title">Share your design.</h2><p>No account needed. Once it is reviewed, it appears in the library with you as its maker.</p></div><button type="button" class="sf-action lib-share-close">Close</button></div>
<div class="lib-share-grid"><form class="lib-form" novalidate>
${field('f-title','Name of your item','<input id="f-title" name="title" required maxlength="80" placeholder="For example: Datsun 240Z rail frame">')}
<div class="lib-pair">${field('f-type','What is it?',choose('f-type','type',Object.entries(SINGLE).map(([k,l])=>`<option value="${k}">${l}</option>`).join('')))}${field('f-scale','Scale',choose('f-scale','scale','<option>1/32</option><option>1/24</option><option>1/43</option><option>HO</option><option value="Not scale-specific">Not scale-specific</option>'))}</div>
<div class="lib-pair">${field('f-app','Made for',choose('f-app','app',appOptions))}${field('f-version','Oldest app version it opens in','<input id="f-version" name="appVersion" maxlength="20" placeholder="0.5.0" inputmode="decimal">','Leave empty if you are not sure.')}</div>
${field('f-description','Description','<textarea id="f-description" name="description" required maxlength="1500" rows="4" placeholder="What it is, what it fits and anything good to know."></textarea>')}
${field('f-original','Original design <span>(optional)</span>','<input id="f-original" name="basedOn" type="url" maxlength="300" placeholder="Paste URL of original design">','Based on someone else’s design? Paste its web address, so its maker gets the credit.')}
<div class="lib-pair">${field('f-picture','Picture','<input id="f-picture" name="picture" type="file" accept="image/png,image/jpeg,image/webp" required>','A screenshot from the app or a photo of the print.')}${field('f-file','Files (.zip)','<input id="f-file" name="file" type="file" accept=".zip,application/zip" required>','Everything needed, zipped, up to 25 MB.')}</div>
<p class="lib-zipinfo" aria-live="polite"></p>
<fieldset class="lib-field"><legend>Printed and tested?</legend><div class="lib-radios"><label><input type="radio" name="printed" value="tested" required> Yes, printed and tested</label><label><input type="radio" name="printed" value="untested"> Not printed yet</label><label><input type="radio" name="printed" value="n/a"> Not a printed item</label></div></fieldset>
<div class="lib-field lib-printnotes" hidden><label for="f-notes">Print notes</label><textarea id="f-notes" name="printNotes" maxlength="1000" rows="3" placeholder="Printer, material, settings and what you found."></textarea></div>
<div class="lib-pair">${field('f-licence','Licence','<select id="f-licence" name="licence" required><option value="CC-BY-4.0">CC BY 4.0: credit me</option><option value="CC-BY-NC-4.0">CC BY-NC 4.0: credit me, no selling</option><option value="CC-BY-SA-4.0">CC BY-SA 4.0: credit me, share changes alike</option><option value="CC0-1.0">CC0: no conditions</option></select>')}${field('f-author','Name to show as its maker','<input id="f-author" name="author" required maxlength="40" autocomplete="nickname">')}</div>
<fieldset class="lib-field"><legend>Your rights</legend><label class="lib-check"><input type="checkbox" name="rights1" required> I made this, or I have the right to share it under this licence.</label><label class="lib-check"><input type="checkbox" name="rights2" required> It contains no paid, copyrighted or trademarked parts of anyone else, such as a maker’s chassis, logos or decals.</label></fieldset>
<div id="lib-turnstile"></div>
<p class="lib-error" role="alert" hidden></p>
<div class="lib-send"><button type="submit" class="sf-action sf-primary">Send for review</button><span class="lib-progress" aria-live="polite"></span></div>
</form><aside class="lib-preview" aria-label="Preview of your item"><div class="sf-kicker">Preview</div><div class="lib-preview-card"></div></aside></div>
<div class="lib-done" hidden><div class="sf-kicker">Sent</div><h2>Thanks for sharing!</h2><p>Your item is waiting for review. Once it is approved it appears in the library with you as its maker.</p><div class="lib-done-actions"><a class="sf-action lib-follow" target="_blank" rel="noopener noreferrer" href="#">Follow its review ↗</a><button type="button" class="sf-action lib-again">Share another</button></div></div>
</section>`;

 const content=`<section class="lib-page is-loading" id="library" data-base="${esc(BASE)}" data-submit="${esc(canSubmit?submitUrl:'')}" data-sitekey="${esc(canSubmit?siteKey:'')}">
<div class="lib-intro"><div><div class="sf-kicker">Community library</div><h1>Built by racers.<br>Shared with everyone.</h1><p>Tracks, chassis, bodies, buildings, liveries, decal sheets and race-screen packs from other SlotForge users, each with a picture, its scale, the app version it needs and whether its maker printed and tested it.</p></div><div class="lib-intro-actions">${share('Share yours')}${external(LIBRARY_REPO+'#readme','How it works ↗','sf-action')}</div></div>
${form}
<div class="lib-tools" hidden><div class="lib-chips" role="group" aria-label="Show">${KINDS.map(([k,l])=>`<button type="button" data-type="${k}" aria-pressed="${k==='all'}">${l}</button>`).join('')}</div>
<div class="lib-row"><input type="search" id="lib-q" placeholder="Search by name, maker or description" aria-label="Search the library"><select id="lib-app" aria-label="App"><option value="">Every app</option>${appOptions}</select><select id="lib-scale" aria-label="Scale"><option value="">Every scale</option><option>1/32</option><option>1/24</option><option>1/43</option><option>HO</option></select><label class="lib-check"><input type="checkbox" id="lib-tested">Printed and tested only</label></div></div>
<p class="lib-count" aria-live="polite"></p>
<div class="lib-grid"></div>
<div class="lib-empty" hidden><div class="sf-kicker">Nothing here yet</div><h2>Be the first.</h2><p>Made a track layout, a chassis, a body or a livery you are proud of? Share it, and it will be the first thing every visitor sees here.</p><ul class="lib-kinds">${KINDS.slice(1).map(([,l])=>`<li>${l}</li>`).join('')}</ul>${share('Share the first item')}</div>
<div class="lib-none" hidden><p>Nothing matches these filters.</p><button type="button" class="sf-action lib-reset">Show everything</button></div>
<div class="lib-failed" hidden><p>The library could not be loaded right now. You can also browse it on GitHub.</p>${external(LIBRARY_REPO+'/tree/main/items','Open on GitHub ↗','sf-action')}</div>
<noscript><p class="lib-failed">The library needs JavaScript. You can also ${external(LIBRARY_REPO+'/tree/main/items','browse it on GitHub ↗','sf-inline')}.</p></noscript>
<ol class="lib-steps"><li><strong>Fill in the form</strong>Name, type, scale, app version, a picture, your files and, if you printed it, your print notes. ${canSubmit?'No account needed.':'You need a free GitHub account.'}</li><li><strong>It is reviewed</strong>Every item is checked before it appears, so the library stays safe to download from.</li><li><strong>It appears here</strong>With you as its maker, a link to the original design it is based on, and the licence you chose.</li></ol>
</section><script defer src="../assets/library.js?v=${assetVersion}"></script>`;
 return shell({name:'library',prefix:'../',page:'library/',title:'Community library — SlotForge',description:'Tracks, chassis, bodies, buildings, liveries and race-screen packs shared by SlotForge users, with previews, scale, required app version and printed-and-tested notes.',content});
}
