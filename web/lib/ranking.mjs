/** Gathering Frontier v2. Heuristic discovery score, not a measure of adoption. */
export const RANKING = {
 version:'frontier-v2', name:'前沿发现',
 weights:{attention:45,momentum:35,building:20},
 smoothingStars:200,minStars7d:20,minForks7d:5,minComparable:3,
 description:'45% 新增 Star + 35% 平滑相对增速 + 20% 新增 Fork；均按同一候选池百分位评分。',
};
const finiteCount = n => Number.isFinite(n) && n >= 0;
export function percentile(values,value){
 if(!values.length)return 0;
 if(values.length===1)return 50;
 const less=values.filter(x=>x<value).length;
 const ties=values.filter(x=>x===value).length;
 return 100*(less+(ties-1)/2)/(values.length-1);
}
export function rankProjects(current,baseline,options={}){
 const sampledAt=Date.parse(current.at), baselineAt=Date.parse(baseline.at);
 const days=(sampledAt-baselineAt)/86400000;
 if(!Number.isFinite(days)||days<7||days>8)throw new Error('Ranking requires a baseline 7–8 days old.');
 const spec={...RANKING,...options};
 const comparable=[];let excludedMissing=0;
 for(const [repo,now] of Object.entries(current.repos)){
  const before=baseline.repos[repo];
  if(!before||![now.stars,now.forks,before.stars,before.forks].every(finiteCount)){excludedMissing++;continue;}
  const starsDelta=now.stars-before.stars,forksDelta=now.forks-before.forks;
  const stars7d=Math.max(0,starsDelta)*7/days,forks7d=Math.max(0,forksDelta)*7/days;
  const relativeGrowth=stars7d/(before.stars+spec.smoothingStars);
  comparable.push({repo,starsDelta,forksDelta,stars7d,forks7d,relativeGrowth,baselineStars:before.stars,eligible:stars7d>=spec.minStars7d||forks7d>=spec.minForks7d});
 }
 const distributions={attention:comparable.map(x=>x.stars7d),momentum:comparable.map(x=>x.relativeGrowth),building:comparable.map(x=>x.forks7d)};
 for(const p of comparable){
  const values={attention:p.stars7d,momentum:p.relativeGrowth,building:p.forks7d};
  p.components=Object.fromEntries(Object.keys(values).map(key=>[key,Math.round(percentile(distributions[key],values[key])*100)/100]));
  p.score=Object.entries(spec.weights).reduce((sum,[key,weight])=>sum+p.components[key]*weight/100,0);
  p.score=Math.round(p.score*100)/100;
 }
 const ranked=comparable.filter(p=>p.eligible).sort((a,b)=>b.score-a.score||b.stars7d-a.stars7d||b.forks7d-a.forks7d||a.repo.localeCompare(b.repo));
 return {version:spec.version,sampledAt:current.at,baselineAt:baseline.at,windowDays:Math.round(days*1000)/1000,comparableCount:comparable.length,eligibleCount:ranked.length,excludedMissing,ready:comparable.length>=spec.minComparable&&ranked.length>=3,ranked,methodology:spec.description};
}
