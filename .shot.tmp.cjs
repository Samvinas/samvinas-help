const { chromium } = require('playwright');
const http = require('http'); const fs = require('fs'); const path = require('path');
const DIST = path.resolve('dist');
const OUTDIR = process.argv[2];
const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); if(p.endsWith('/'))p+='index.html'; const f=path.join(DIST,p); if(!fs.existsSync(f)){res.writeHead(404);return res.end();} res.writeHead(200,{'content-type':MIME[path.extname(f)]||'text/plain'}); fs.createReadStream(f).pipe(res); });
(async()=>{
  await new Promise(r=>server.listen(0,r));
  const base='http://localhost:'+server.address().port;
  const browser=await chromium.launch();
  const shots=[
    ['landing-desktop','/index.html',1280,'light',false],
    ['landing-dark','/index.html',1280,'dark',false],
    ['landing-mobile','/index.html',390,'light',false],
    ['explorer-desktop','/facilitator/option-explorer.html',1280,'light',true],
  ];
  for (const [name,url,w,scheme,full] of shots){
    const page=await browser.newPage({viewport:{width:w,height:1000},colorScheme:scheme});
    await page.goto(base+url);
    await page.screenshot({path:path.join(OUTDIR,name+'.png'),fullPage:full});
    await page.close();
  }
  await browser.close(); server.close();
  console.log('shots written');
})().catch(e=>{console.error(e);process.exit(2)});
