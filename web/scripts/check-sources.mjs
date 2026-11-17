import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const root=new URL('../content/',import.meta.url);
const config=JSON.parse(await fs.readFile(new URL('frontiers.json',root),'utf8'));
let previous={checks:[]};try{previous=JSON.parse(await fs.readFile(new URL('source-checks.json',root),'utf8'));}catch{}
const checks=await Promise.all(config.sources.map(async source=>{
 const at=new Date().toISOString();
 try{
  const res=await fetch(source.url,{headers:{'User-Agent':'Gathering-Source-Check/1.0'},signal:AbortSignal.timeout(20000)});
  if(!res.ok)throw Error(`HTTP ${res.status}`);
  if(!res.headers.get('content-type')?.includes('text/html'))throw Error('Expected an HTML page');
  const html=await res.text();
  const text=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const hash=crypto.createHash('sha256').update(text).digest('hex');
  const before=previous.checks.find(x=>x.id===source.id&&x.hash);
  return {id:source.id,checkedAt:at,status:'reachable',httpStatus:res.status,finalUrl:res.url,hash,changed:before?before.hash!==hash:null,note:'页面可访问不等于内容已核验；指纹变化也不等于技术发布。'};
 }catch(error){return {id:source.id,checkedAt:at,status:'failed',error:error.message};}
}));
await fs.writeFile(new URL('source-checks.json',root),JSON.stringify({checkedAt:new Date().toISOString(),automatedSchedule:false,checks},null,2));
console.log(JSON.stringify(checks.map(({id,status,httpStatus,error})=>({id,status,httpStatus,error})),null,2));
