// Preloaded into each app's main process (NODE_OPTIONS=--require).
// Redirects every user-data location into a throwaway profile so captures never touch real data.
const path=require('node:path'),fs=require('node:fs');
const profile=process.env.SF_CAPTURE_PROFILE;
if(!profile){console.error("SF_CAPTURE_PROFILE missing; refusing to start");process.exit(1);}
if(process.versions.electron&&process.type==="browser"){
 const {app}=require('electron');
 const redirect={userData:'userData',appData:'appData',documents:'Documents',desktop:'Desktop',downloads:'Downloads',home:'home',temp:'temp'};
 for(const dir of Object.values(redirect))fs.mkdirSync(path.join(profile,dir),{recursive:true});
 const getPath=app.getPath.bind(app),setPath=app.setPath.bind(app);
 const overrides={};
 for(const [k,dir] of Object.entries(redirect)){overrides[k]=path.join(profile,dir);setPath(k,overrides[k]);}
 app.getPath=name=>overrides[name]||getPath(name);
 app.setPath=(name,value)=>{if(name in overrides){/* keep isolated profile */return;}setPath(name,value);};
}
