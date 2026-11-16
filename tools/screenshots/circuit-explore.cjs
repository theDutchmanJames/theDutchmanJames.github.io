// Scratch exploration helper: launch Circuit, import demo layout, run a snippet file, take shots into incoming-screenshots/circuit-explore.
const path=require('node:path'),fs=require('node:fs');const {launch,shot,CLAUDE}=require('./lib.cjs');const L=require('./circuit-data/layout.cjs');
(async()=>{
 const {app,page}=await launch('Circuit',{appRoot:path.join(__dirname,'circuit-shell'),electronPath:require(path.join(CLAUDE,'Decals/node_modules/electron')),env:{SF_CIRCUIT_ROOT:path.join(CLAUDE,'Circuit')}});
 page.on('console',m=>{if(m.type()==='error')console.log('console:',m.text())});page.on('pageerror',e=>console.log('pageerror',e.message));
 await page.waitForTimeout(2500);
 await page.addStyleTag({content:'#toast{display:none!important}'});
 const steps=require(path.resolve(process.argv[2]));
 await steps({app,page,shot:(n)=>shot(page,'circuit-explore',n),L});
 await app.close();
})().catch(e=>{console.error(e);process.exit(1)});
