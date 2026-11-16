// Builds the "Club Circuit" demo layout with Circuit's own geometry code (read-only require).
const path=require('node:path');
const APP=path.resolve(__dirname,'../../../..','Circuit/app');
global.window=global;require(path.join(APP,'catalogue.js'));
const F=require(path.join(APP,'core.js'));const G=F.G;
const defs={};for(const pack of window.TRACK_PACKS)for(const d of pack.pieces)if(d.parameters&&d.parameters.type)defs[d.id]={...d,geometry:G.derive(d.parameters)};
const T={S:'carrera:20509',s:'carrera:20611',q:'carrera:20612',A:'carrera:20571',B:'carrera:20572',C:'carrera:20573',D:'carrera:20578',a:'carrera:20577'};
// token: letter = piece, suffix L = flipped (left turn)
function build(tokens){const items=[];let last;for(const t of tokens){const d=defs[T[t[0]]];let p=F.pose(d,0,0);p.flip=t[1]==='L';if(last)p=F.join(p,d,0,F.ports(last,defs)[1]);items.push(p);last=p;}return items;}
function closure(items){const a=F.ports(items[0],defs)[0],b=F.ports(items.at(-1),defs)[1];return [Math.hypot(a.position[0]-b.position[0],a.position[1]-b.position[1]),((a.angle-b.angle)%360+540)%360-180];}
function layout(tokens,{title='Club Circuit',borders=true,guide,timing}={}){
 let items=build(tokens);
 if(borders){const plan=F.planBorders(items,items,defs,['inner','outer']);items=[...items,...plan.added];}
 const used=[...new Set(items.map(p=>p.definitionId))];
 const b=F.bounds(items,defs);
 const raw={format:'slotforge.layout',version:1,title,pieces:items,definitions:used.map(id=>{const d=defs[id];return{id:d.id,name:d.name,sku:d.sku,pack:d.pack,family:d.family,parameters:d.parameters,color:d.color,status:d.status,mirror:d.mirror}}),profile:{...F.presets.Balanced},workspace:{}};
 if(guide)raw.workspace.spaceGuide={x:Math.round(b[0]-guide.margin),y:Math.round(b[1]-guide.margin),lengthMm:Math.round(b[2]+2*guide.margin),widthMm:Math.round(b[3]+2*guide.margin),kind:'table',locked:true};
 if(timing)raw.timing={version:1,direction:1,startFinish:{pieceId:items[timing.index].id,fraction:timing.fraction??.5}};
 return {raw,items,bounds:b,closure:closure(build(tokens))};
}
module.exports={F,defs,build,layout,closure};
if(require.main===module){const half=process.argv[2].split(',');const r=layout([...half,...half],{borders:true});console.log('closure',r.closure,'bounds',r.bounds,'pieces',r.items.length);}
