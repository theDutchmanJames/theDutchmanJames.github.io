// Shared launcher for screenshot captures. Every app runs against a throwaway profile.
const path=require('node:path'),fs=require('node:fs');
const CLAUDE=path.resolve(__dirname,'../../..');
const {_electron}=require(path.join(CLAUDE,'Livery/node_modules/playwright'));
const OUT=path.resolve(__dirname,'../../incoming-screenshots');
// Fixed emulated viewport: 1600×963 CSS px at 1.6× → 2560×1540 files (same as the Paddock set),
// independent of the real screen size.
const W=1600,H=963,SCALE=1.6;
async function viewport(page){
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:SCALE,mobile:false});
}

async function launch(appName,{appRoot,electronPath,args=[],env={},seed}={}){
 appRoot=appRoot||path.join(CLAUDE,appName);
 const profile=path.join(__dirname,'.profiles',`${appName.toLowerCase()}-${Date.now()}`);
 fs.mkdirSync(profile,{recursive:true});
 if(seed)await seed(profile);
 // Wrapper entry: isolation runs before any app code, then the real main is required.
 const pkg=JSON.parse(fs.readFileSync(path.join(appRoot,'package.json'),'utf8'));
 const wrap=path.join(profile,'wrapper');fs.mkdirSync(wrap,{recursive:true});
 fs.writeFileSync(path.join(wrap,'package.json'),JSON.stringify({name:pkg.name,productName:pkg.productName||pkg.build?.productName,version:pkg.version||'1.0.0',main:'main.cjs'}));
 fs.writeFileSync(path.join(wrap,'main.cjs'),`require(${JSON.stringify(path.join(__dirname,'isolate.cjs'))});require(${JSON.stringify(path.resolve(appRoot,pkg.main||'main.js'))});`);
 const e={...process.env,...env,SF_CAPTURE_PROFILE:profile};delete e.ELECTRON_RUN_AS_NODE;
 const app=await _electron.launch({executablePath:electronPath||require(path.join(appRoot,'node_modules/electron')),args:[`--force-device-scale-factor=${SCALE}`,wrap,...args],env:e,cwd:appRoot});
 const paths=await app.evaluate(({app})=>[app.getPath('userData'),app.getPath('documents'),app.getPath('appData')]);
 if(!paths.every(p=>p.startsWith(profile))){await app.close();throw Error('Isolation failed: '+paths.join(', '));}
 const page=await app.firstWindow();
 await app.evaluate(({BrowserWindow},[w,h])=>{const win=BrowserWindow.getAllWindows()[0];win.unmaximize();win.setContentSize(w,h);win.center();},[W,H]);
 await viewport(page);
 page.on('load',()=>viewport(page).catch(()=>{}));
 await page.waitForTimeout(300);
 return {app,page,profile};
}

async function shot(page,appName,name){
 const dir=path.join(OUT,appName.toLowerCase());fs.mkdirSync(dir,{recursive:true});
 const file=path.join(dir,`${name}.png`);
 await viewport(page);
 const cdp=await page.context().newCDPSession(page);
 const {data}=await cdp.send("Page.captureScreenshot",{format:"png",fromSurface:true,clip:{x:0,y:0,width:W,height:1540/SCALE,scale:1}});
 fs.writeFileSync(file,Buffer.from(data,"base64"));
 console.log('saved',path.relative(OUT,file));return file;
}

module.exports={launch,shot,CLAUDE,OUT,W,H};
