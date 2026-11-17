import fs from 'node:fs/promises';
import path from 'node:path';
import {rankProjects,RANKING} from '../lib/ranking.mjs';
const dir = path.resolve(process.env.GATHERING_DATA_DIR || 'data');
await fs.mkdir(dir, {recursive:true});
const headers = {'Accept':'application/vnd.github+json','User-Agent':'Gathering'};
if(process.env.GITHUB_TOKEN) headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
async function get(url){
 const res=await fetch(url,{headers,signal:AbortSignal.timeout(30000)});
 if(!res.ok)throw new Error(`GitHub ${res.status}: ${url}`);
 return res.json();
}
const now=new Date();
const files=(await fs.readdir(dir)).filter(f=>/^snapshot-.*\.json$/.test(f)).sort();
let baseline;
for(const file of files){
 const s=JSON.parse(await fs.readFile(path.join(dir,file),'utf8'));
 const age=(now-new Date(s.at))/86400000;
 if(age>=7&&age<=8)baseline=s;
}
const pool=new Map();
for(const topic of ['llm','ai-agents','generative-ai','rag']){
 const result=await get(`https://api.github.com/search/repositories?q=${encodeURIComponent(`topic:${topic} archived:false fork:false stars:>100`)}&sort=updated&per_page=30`);
 if(result.incomplete_results)throw new Error('GitHub search incomplete; retry later');
 for(const repo of result.items)if(repo.license&&repo.license.spdx_id!=='NOASSERTION')pool.set(repo.full_name,repo);
}
// Refresh baseline repositories even when they fall out of today's discovery results.
if(baseline)for(const name of Object.keys(baseline.repos)){
 if(!pool.has(name))pool.set(name,await get(`https://api.github.com/repos/${name}`));
}
const repos=Object.fromEntries([...pool].filter(([,r])=>!r.archived&&!r.fork&&r.license&&r.license.spdx_id!=='NOASSERTION').map(([name,r])=>[name,{stars:r.stargazers_count,forks:r.forks_count,description:r.description||'',language:r.language||'',license:r.license.spdx_id,topics:r.topics||[],createdAt:r.created_at,pushedAt:r.pushed_at}]));
const snapshot={at:now.toISOString(),repos};
// Preserve the first observation of the day, so reruns cannot move the seven-day baseline forward.
const snapshotPath=path.join(dir,`snapshot-${now.toISOString().slice(0,10)}.json`);
try{await fs.writeFile(snapshotPath,JSON.stringify(snapshot,null,2),{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;}
if(!baseline){console.log('Baseline saved. A report needs a snapshot 7–8 days old.');process.exit(0);}
const ranking=rankProjects(snapshot,baseline);
if(!ranking.ready){console.log(`Insufficient ranking evidence: ${ranking.comparableCount} comparable, ${ranking.eligibleCount} above activity floor. No new report published.`);process.exit(0);}
const projects=ranking.ranked.slice(0,3).map((p,index)=>{
 const r=pool.get(p.repo);
 return {...p,rank:index+1,name:r.name,category:'AI 开源',summary:r.description||'项目暂未提供描述。',useCase:'具体应用场景请阅读项目 README；当前尚未生成人工审核的中文解读。',url:r.html_url};
});
const {ranked,...audit}=ranking;
const report={demo:false,period:`${baseline.at.slice(0,10)} — ${now.toISOString().slice(0,10)}`,generatedAt:now.toISOString(),candidateCount:ranking.comparableCount,ranking:{...audit,spec:RANKING},methodology:RANKING.description,projects};
await fs.writeFile(path.join(dir,'latest.json'),JSON.stringify(report,null,2));
await fs.writeFile(path.join(dir,`report-${now.toISOString().slice(0,10)}.json`),JSON.stringify(report,null,2));
console.log(`Frontier v2 report generated: ${ranking.eligibleCount} qualified out of ${ranking.comparableCount} comparable candidates.`);
