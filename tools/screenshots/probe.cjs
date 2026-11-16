const path=require('node:path');const {launch,shot,CLAUDE}=require('./lib.cjs');
(async()=>{
 const name=process.argv[2];
 const opts=name==='Circuit'?{appRoot:path.join(__dirname,'circuit-shell'),electronPath:require(path.join(CLAUDE,'Decals/node_modules/electron')),env:{SF_CIRCUIT_ROOT:path.join(CLAUDE,'Circuit')}}:{};
 const {app,page,profile}=await launch(name,opts);
 await page.waitForTimeout(4000);
 console.log('profile',profile,'url',page.url());
 console.log(await app.evaluate(({app})=>({userData:app.getPath('userData'),docs:app.getPath('documents')})));
 await shot(page,'probe',name);
 await app.close();
})().catch(e=>{console.error(e);process.exit(1)});
