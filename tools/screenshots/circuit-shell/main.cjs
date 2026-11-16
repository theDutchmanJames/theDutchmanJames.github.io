// Minimal desktop shell for Circuit's browser app, used only for screenshots.
const {app,BrowserWindow}=require('electron'),path=require('node:path');
app.whenReady().then(()=>{
 const win=new BrowserWindow({width:1280,height:770,useContentSize:true,autoHideMenuBar:true,show:true,webPreferences:{contextIsolation:true}});
 win.setMenu(null);
 win.loadFile(path.join(process.env.SF_CIRCUIT_ROOT,'app/index.html'),{hash:process.env.SF_CIRCUIT_HASH||'builder'});
});
app.on('window-all-closed',()=>app.quit());
