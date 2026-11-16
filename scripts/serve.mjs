import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8','.pdf':'application/pdf','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  const requestPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const filename=path.resolve(root,'.'+requestPath);
  if(filename!==root&&!filename.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  let finalPath=filename;let stat=await fs.stat(finalPath);
  if(stat.isDirectory()){
   if(!requestPath.endsWith('/')){res.writeHead(301,{Location:requestPath+'/'+new URL(req.url,'http://localhost').search});res.end();return;}
   finalPath=path.join(finalPath,'index.html');stat=await fs.stat(finalPath);
  }
  if(!stat.isFile())throw Error('Not a file');
  res.writeHead(200,{'Content-Type':types[path.extname(finalPath)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:await fs.readFile(finalPath));
 }catch(error){res.writeHead(error instanceof URIError?400:404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Page not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}/\nServing dist/ on this computer only. Press Ctrl+C to stop.`));
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
