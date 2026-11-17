export const FRONTIER_RANKING={version:'frontier-cross-source-v1',weights:{novelty:30,applicability:30,evidence:25,recency:15},maxPerOrganization:2};
export function rankFrontiers(items,{asOf=new Date().toISOString()}={}){
 const now=Date.parse(asOf);if(!Number.isFinite(now))throw Error('Invalid asOf date');
 const byId=new Map();const excluded=[];
 for(const item of items){
  const id=item.canonicalId||item.id;const review=item.review;
  const publication=Date.parse(item.changedAt||item.publishedAt);
  const days=(now-publication)/86400000;
  const primary=(item.sources||[]).some(s=>s.primary===true&&/^https:\/\//.test(s.url));
  const assessed=['novelty','applicability','evidence'].every(key=>Number.isFinite(review?.[key]?.rating)&&review[key].rating>=0&&review[key].rating<=5&&typeof review[key].reason==='string'&&review[key].reason.trim());
  if(!id||!item.organization||!primary||!assessed||!Number.isFinite(days)||days<0||days>7||review.evidence.rating<3){excluded.push({id,reason:!Number.isFinite(days)?'发布时间或实质更新日期待确认':!assessed?'编辑评估待完成':!primary?'缺少原始来源':days<0||days>7?'不在本周窗口':'证据不足'});continue;}
  const components={novelty:review.novelty.rating*20,applicability:review.applicability.rating*20,evidence:review.evidence.rating*20,recency:100*(1-days/7)};
  const score=Math.round(Object.entries(FRONTIER_RANKING.weights).reduce((sum,[key,weight])=>sum+components[key]*weight/100,0)*100)/100;
  const p={...item,score,components,scoringVersion:FRONTIER_RANKING.version};
  const previous=byId.get(id);if(!previous||p.score>previous.score)byId.set(id,p);
 }
 const sorted=[...byId.values()].sort((a,b)=>b.score-a.score||(a.canonicalId||a.id).localeCompare(b.canonicalId||b.id));
 const counts=new Map();const selected=[];
 for(const item of sorted){const count=counts.get(item.organization)||0;if(count>=FRONTIER_RANKING.maxPerOrganization)continue;selected.push(item);counts.set(item.organization,count+1);if(selected.length===3)break;}
 return {version:FRONTIER_RANKING.version,asOf,ready:selected.length===3,ranked:selected,excluded,qualified:sorted.length};
}
