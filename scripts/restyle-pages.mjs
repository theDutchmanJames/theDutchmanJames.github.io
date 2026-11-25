// SlotForge Restyle — homepage and Pit Wall menu markup.
// Broadcast-style homepage and a grouped Pit Wall menu, after the Timing 2.4 redesign (SlotForgeRestyle.md).


// Every app is a "lane" with its own number and colour, in menu order, like the lanes in Timing.
export const LANES=['Timing','Paddock','Circuit','Foundry','Anvil','Frame','Decals','Livery','Telemetry'];
// Stripe colours stay with each app; a new app gets the next colour (--l7, …) instead of shifting the others.
const COLOURS=['Timing','Paddock','Circuit','Decals','Livery','Telemetry','Foundry','Anvil','Frame'];
export const lane=name=>COLOURS.indexOf(name)+1;

// Odometer: each digit on its own little tile.
export const odo=(n,width=4)=>`<span class="odo" aria-label="${n}">${String(n).padStart(width,'0').split('').map(d=>`<i aria-hidden="true">${d}</i>`).join('')}</span>`;

// Pit Wall: the menu as grouped tabs on a dark track, each with its app icon; Try Circuit as an ON AIR button.
export function pitWall({prefix,name,slug,icon}){
 const tab=app=>`<a class="sf-nav pw-tab" href="${prefix}${slug(app)}/"${name===app?' aria-current="page"':''}><img src="${icon(app,prefix)}" alt="" width="20" height="20">${app}</a>`;
 const group=(label,list)=>`<span class="pw-grp" role="group" aria-label="${label}"><span class="pw-label">${label}</span>${list.map(tab).join('')}</span>`;
 return `${group('Race and garage',['Timing','Paddock'])}${group('Track',['Circuit'])}${group('3D printing',['Foundry','Anvil','Frame'])}${group('Analysis',['Telemetry'])}${group('Paint and print',['Livery','Decals'])}<a class="sf-nav sf-nav-about pw-about" href="${prefix}about/" title="About SlotForge"${name==='about'?' aria-current="page"':''}><svg class="pw-about-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".6" fill="currentColor"/></svg><span class="pw-about-text">About</span></a><span class="pw-light" title="Every app is free">All free</span><a class="pw-onair sf-try-circuit" href="${prefix}circuit/online/app/index.html"><i aria-hidden="true"></i>Try Circuit Online!</a>`;
}

export function homepageV2(h){
 const {apps,galleries,releases,partsLists,icon,slug,esc,external,imagePath,themedImage}=h;
 const totalParts=partsLists.catalogues.reduce((t,c)=>t+c.parts+c.supplies,0);
 const fmt=d=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',timeZone:'Europe/Amsterdam'}).format(new Date(d));
 const laneVar=app=>`--lane-c:var(--l${lane(app)})`;

 // Broadcast Hero: the race screen across the page, big Barlow on it, a start bar rising into the bottom.
 const fact=(d,title,text)=>`<div class="bh-lane"><b><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg></b><span><strong>${title}</strong><small>${text}</small></span></div>`;
 const hero=`<section class="bh" aria-labelledby="bh-title">
  <div class="bh-pic"><img src="assets/restyle/hero-track.jpg" alt="Two slotcars side by side through a curve on a home track" width="2000" height="1502" fetchpriority="high"></div>
  <div class="bh-band"><div class="bh-date"><i></i>Free apps for slotcar racers &amp; builders</div>
   <h1 id="bh-title">More from <em>every lap.</em></h1>
   <p>Lap timing and race management for your analogue slotcar track. Plus tools to design and 3D print your track, car bodies and chassis, prepare cars and bring your collection to life.</p></div>
  <div class="bh-start">
   <div class="bh-mark" aria-hidden="true"><svg viewBox="207.5 9 87.5 90" width="70" height="72"><path fill="#f5f5f5" d="M280.17,22.51H222.31c-1.4,0-2.1.75-2.1,2.24v4.14a1.87,1.87,0,0,0,2.1,2.13h57.86a1.87,1.87,0,0,0,2.11-2.13V24.75C282.28,23.26,281.58,22.51,280.17,22.51Z"/><path fill="#f5f5f5" d="M280.17,10.63H222.31c-1.4,0-2.1.75-2.1,2.24V17a1.87,1.87,0,0,0,2.1,2.14h57.86A1.88,1.88,0,0,0,282.28,17V12.87C282.28,11.38,281.58,10.63,280.17,10.63Z"/><path fill="#e5484d" d="M258,35H241.85a2,2,0,0,0-2,1.59L234.75,61a2,2,0,0,0,1.95,2.42h6.15a2,2,0,0,1,2,2l-.13,32.06L272.1,49.11H259.83a2,2,0,0,1-1.95-2.45l2.09-9.2A2,2,0,0,0,258,35Z"/></svg></div>
   <div class="bh-lanes">${fact('M5 12.5 9.5 17 19 7','All apps free','Every app, every feature')}${fact('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0M4 4l16 16','No accounts<br>or sign‑ups','Download and start')}${fact('M3 5h18v11H3zM8 20h8M12 16v4','Windows, macOS<br>and Linux','Runs on your own computer')}</div>
   <div class="bh-go"><a class="bh-startbtn" href="#apps">SlotForge Apps<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a><a class="bh-alt" href="#releases">Latest releases ↓</a></div>
  </div></section>`;


 // The apps as Garage Cards (the first restyle): picture edge to edge, icon, eyebrow, Barlow title, foot with the links.
 const cards=LANES.map(name=>{const app=apps[name];return `<article class="sf-app-card sf-app-card-shot"><a class="sf-card-shot" href="${slug(name)}/" tabindex="-1" aria-hidden="true">${themedImage(name,galleries[name][0],'./')}</a><div class="sf-card-head"><img src="${icon(name,'./')}" alt="" width="40" height="40"><div><div class="sf-category">${esc(app.category)}</div><h3><a href="${slug(name)}/">${name}</a></h3></div></div><p>${esc(app.short)}</p><div class="sf-card-links"><a class="sf-inline" href="${slug(name)}/">See ${name} →</a><a class="sf-inline sf-card-download" href="${slug(name)}/#downloads">Free download ↓</a></div></article>`;}).join('');
 const grid=`<section class="hb-sec sf-apps" id="apps" aria-labelledby="grid-title"><div class="hb-head"><h2 id="grid-title">Find your next tool</h2><span class="hb-count">${LANES.length} apps · all free</span><span class="hb-tag">Pick one, or use them all.</span></div><div class="sf-grid">${cards}</div></section>`;

 // Better together: the original flow lanes (styled by the first restyle).
 const node=(name,text)=>`<a class="flow-node" href="${slug(name)}/"><img src="${icon(name,'./')}" alt="" width="36" height="36"><span><strong>${name}</strong><small>${text}</small></span></a>`;
 const arrow=c=>`<span class="flow-arrow" aria-hidden="true">${c}</span>`;
 const together=`<section class="hb-sec sf-flow" aria-labelledby="flow-title"><div class="hb-head"><h2 id="flow-title">One hobby. One workshop.</h2><span class="hb-count">Better together</span><span class="hb-tag">Use one app, or let them work together.</span></div><div class="flow-grid"><article class="flow-lane"><h3>Race night</h3><div class="flow-steps">${node('Circuit','Design the track')}${arrow('→')}${node('Timing','Race on it')}${arrow('→')}${node('Telemetry','Learn from it')}</div><p>Send a Circuit layout to Timing’s Live Track. Finalised Timing results can go to Paddock, where Telemetry reads them for analysis.</p></article><article class="flow-lane"><h3>Build the track</h3><div class="flow-steps">${node('Circuit','Draw the layout')}${arrow('→')}${node('Foundry','Print every part')}</div><p>Import a Circuit drawing (SVG or DXF) into Foundry, and it builds the printable road from its lanes and edges.</p></article><article class="flow-lane"><h3>Build the car</h3><div class="flow-steps">${node('Anvil','Print the body')}${arrow('⇄')}${node('Frame','Print the chassis')}</div><p>Trace a Frame chassis from an Anvil body, then send the chassis and its mount spots back to Anvil, which builds the posts on them.</p></article><article class="flow-lane"><h3>Your cars</h3><div class="flow-steps">${node('Paddock','Keep every car')}${arrow('⇄')}${node('Timing','Race them')}</div><p>Paddock makes your car details available to Timing, and race results come back to each car’s history.</p></article><article class="flow-lane"><h3>The look</h3><div class="flow-steps">${node('Decals','Print the details')}${arrow('→')}${node('Livery','Paint the car')}</div><p>Bring Decals packs and sheets into Livery to try every graphic on the car before you paint the model.</p></article></div></section>`;

 // What's new as a timing tower: newest release on top in purple, the others with their gap in days.
 const rel=Object.entries(releases.apps).sort((a,b)=>new Date(b[1].publishedAt)-new Date(a[1].publishedAt));
 const first=new Date(rel[0][1].publishedAt);
 const days=d=>Math.round((first-new Date(d))/864e5);
 const tower=`<section class="hb-sec" id="releases" aria-labelledby="tower-title"><div class="hb-head"><h2 id="tower-title">Latest releases</h2><span class="hb-count">live</span><span class="hb-tag">Every app is updated regularly.</span></div>
  <ol class="hb-tower">${rel.map(([n,r],i)=>`<li style="${laneVar(n)}"><span class="ht-pos">${i+1}</span><span class="ht-stripe"></span><img src="${icon(n,'./')}" alt="" width="26" height="26"><strong>${n}</strong><span class="ht-time">${esc(r.tag)}</span><span class="ht-date">${fmt(r.publishedAt)}</span><span class="ht-chip${i===0?' best':days(r.publishedAt)===0?' up':''}">${i===0?'Newest':days(r.publishedAt)===0?'Same day':'+'+days(r.publishedAt)+' days'}</span>${external(r.url,`<span aria-hidden="true">Notes ↗</span><span class="sf-sr">${n} ${esc(r.tag)} release notes</span>`,'ht-link')}</li>`).join('')}</ol></section>`;

 // Who it's for as a race brief: a tile per kind of racer.
 const brief=[['Home & club racers','Race the family on a Friday night or run a full club evening. Heats, lane rotations, championships and a race display for the club TV.','Timing'],['Collectors',`Give every car a place in your own showroom, with its photos, parts, setups and maintenance history. Free parts lists from ${partsLists.catalogues.length} brands get you started.`,'Paddock'],['Decal makers','Turn your own artwork into printable decal sheets. Size and arrange every graphic, check a sizing proof and print at actual size.','Decals']];
 const forWho=`<section class="hb-sec" aria-labelledby="who-title"><div class="hb-head"><h2 id="who-title">Made for every race night</h2></div><div class="hb-brief">${brief.map(([t,x,a])=>`<article><h3>${esc(t)}</h3><p>${esc(x)}</p><a href="${slug(a)}/">Start with ${a} →</a></article>`).join('')}</div></section>`;

 // Circuit online as ON AIR.
 const onair=`<section class="hb-onair"><div><div class="hb-live"><i></i>On air · in your browser</div><h2>Design your next track. Right now.</h2><p>No download needed: open Circuit in your browser and start laying track. Prefer it on your computer? The desktop edition is free too.</p></div><a class="bh-startbtn" href="circuit/online/app/index.html">Open Circuit ↗</a></section>`;

 // Finale: the red banner of the app's Home.
 const finale=`<section class="hb-finale"><h2>Your next race night starts here.</h2><p>Free to download. No account. Runs on your own computer.</p><div><a class="bh-startbtn bh-startbtn-light" href="timing/#downloads">Download Timing free ↓</a><a class="bh-alt" href="circuit/online/app/index.html">Design a track in your browser ↗</a></div></section>`;

 return `${hero}${grid}${together}${tower}${forWho}${onair}${finale}`;
}
