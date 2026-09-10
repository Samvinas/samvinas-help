const { chromium } = require('playwright');
const http = require('http'); const fs = require('fs'); const path = require('path');
const DIST = path.resolve('dist');
const MIME = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml' };
const server = http.createServer((req,res)=>{ let p=decodeURIComponent(new URL(req.url,'http://x').pathname); if(p.endsWith('/'))p+='index.html'; const f=path.join(DIST,p); if(!fs.existsSync(f)){res.writeHead(404);return res.end();} res.writeHead(200,{'content-type':MIME[path.extname(f)]||'text/plain'}); fs.createReadStream(f).pipe(res); });
(async()=>{
  await new Promise(r=>server.listen(0,r));
  const base='http://localhost:'+server.address().port;
  const browser=await chromium.launch();
  let bad=0;
  for (const [name, w] of [['desktop',1280],['mobile',390]]) {
    const page=await browser.newPage({viewport:{width:w,height:900}});
    await page.goto(base+'/facilitator/brainstorm.html');
    await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
    const r=await page.evaluate(()=>axe.run());
    console.log(name+': '+(r.violations.length?'VIOLATIONS':'clean'));
    r.violations.forEach(v=>{bad++;console.log(' -',v.id,v.impact,v.nodes.length+' nodes:',v.nodes[0].target.join(' '))});
    await page.click('[role=tab]:nth-of-type(2), .tablist button:nth-child(2)').catch(()=>{});
    const r2=await page.evaluate(()=>axe.run());
    r2.violations.forEach(v=>{bad++;console.log(' - (tab2)',v.id,v.impact)});
  }
  await browser.close(); server.close();
  console.log(bad?bad+' violation groups':'axe: clean on both viewports, both tab states');
  process.exit(bad?1:0);
})().catch(e=>{console.error(e);process.exit(2)});
