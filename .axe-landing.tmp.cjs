const { chromium } = require('playwright');
const http = require('http'); const fs = require('fs'); const path = require('path');
const DIST = path.resolve('dist');
const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); if(p.endsWith('/'))p+='index.html'; const f=path.join(DIST,p); if(!fs.existsSync(f)){res.writeHead(404);return res.end();} res.writeHead(200,{'content-type':MIME[path.extname(f)]||'text/plain'}); fs.createReadStream(f).pipe(res); });
(async()=>{
  await new Promise(r=>server.listen(0,r));
  const base='http://localhost:'+server.address().port;
  const browser=await chromium.launch();
  let bad=0;
  for (const url of ['/index.html','/facilitator/option-explorer.html','/facilitator/index.html']) {
    for (const [name, w] of [['desktop',1280],['mobile',390]]) {
      const page=await browser.newPage({viewport:{width:w,height:900}});
      await page.goto(base+url);
      await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
      const r=await page.evaluate(()=>axe.run());
      console.log(url+' '+name+': '+(r.violations.length?'VIOLATIONS':'clean'));
      r.violations.forEach(v=>{bad++;console.log(' -',v.id,v.impact,v.nodes.length+' nodes:',v.nodes[0].target.join(' '))});
      // reflow check: no horizontal scroll at 320px equivalent
      await page.close();
    }
  }
  // keyboard walk on the landing: tab through, ensure the three card links are reachable & ringed
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  await page.goto(base+'/index.html');
  const hrefs=[];
  for (let i=0;i<6;i++){ await page.keyboard.press('Tab');
    const h=await page.evaluate(()=>document.activeElement && document.activeElement.getAttribute('href'));
    hrefs.push(h);}
  console.log('first focus stops:', hrefs.join(' | '));
  // 320px reflow
  const p2=await browser.newPage({viewport:{width:320,height:900}});
  await p2.goto(base+'/index.html');
  const overflow=await p2.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
  console.log('320px horizontal overflow:', overflow?'YES (BAD)':'none');
  if(overflow)bad++;
  await browser.close(); server.close();
  console.log(bad?bad+' problems':'ALL CLEAN');
  process.exit(bad?1:0);
})().catch(e=>{console.error(e);process.exit(2)});
