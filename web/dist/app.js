'use strict';
const $=s=>document.querySelector(s);
const state={catalog:null,reports:[],view:'weekly',category:'全部',source:'全部来源',query:'',sort:'default',limit:12,selectedReport:null,saved:readSaved()};
const categories=['全部','智能体安全','算法发现','智能体','知识库','模型工具','基础设施','其他 AI'];
const sourceTypes=['全部来源','公司技术','研究成果','开源项目'];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const itemKey=p=>p.repo||p.id;
function readSaved(){try{const value=JSON.parse(localStorage.getItem('signal-saved')||'[]');return Array.isArray(value)?value.filter(x=>typeof x==='string'):[];}catch{return [];}}
function formatNumber(n){return Number(n||0).toLocaleString('en-US');}
function signedNumber(n){return(Number(n)>0?'+':'')+formatNumber(n);}
function formatTime(value){return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));}
function safeUrl(value){try{const url=new URL(value);return url.protocol==='https:'?url.href:'#';}catch{return '#';}}
function allItems(){return [...(state.catalog?.frontiers||[]),...(state.catalog?.projects||[])];}
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,2400);}
function card(p,index,weekly=false){
 const key=itemKey(p),saved=state.saved.includes(key),isRepo=Boolean(p.repo);
 const url=isRepo?'https://github.com/'+p.repo:p.url;
 const metrics=isRepo?(weekly?`<span>周期 Star <b>${signedNumber(p.starsDelta)}</b></span><span>周期 Fork <b>${signedNumber(p.forksDelta)}</b></span>`:`<span>☆ Star <b>${formatNumber(p.stars)}</b></span><span>⑂ Fork <b>${formatNumber(p.forks)}</b></span>`):`<span>${esc(p.organization)}</span><span>${esc(p.status)}</span><span>${p.publishedAt?'原文 '+esc(p.publishedAt):'发布日期待确认'}</span>`;
 const details=isRepo?'':`<details class="technology-details"><summary>借鉴思路与适用边界 <span>↓</span></summary><div><h4>为什么值得借鉴</h4><p>${esc(p.takeaway)}</p><h4>适用边界</h4><p>${esc(p.limitation)}</p><h4>原始资料</h4>${(p.sources||[]).map(s=>`<a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join('')}<p class="source-date">${p.publishedAt?'原文发布：'+esc(p.publishedAt):'原文发布日期：未确认'} · 核验：${esc(p.verifiedAt)}<br>核验日期不等于发布日期；借鉴思路为编辑解读。</p></div></details>`;
 return `<article class="project-card ${state.view==='weekly'&&index===0?'featured':''}"><div class="card-inner"><div class="card-top"><div class="card-top-left"><span class="project-number">${String(index+1).padStart(2,'0')}</span><span class="category-tag">${esc(p.kind||'开源项目')} · ${esc(p.category)}</span></div><button class="save-button ${saved?'saved':''}" data-save="${esc(key)}" aria-pressed="${saved}" aria-label="${saved?'取消收藏':'收藏'} ${esc(p.name)}" title="${saved?'取消收藏':'收藏技术'}"><svg viewBox="0 0 18 21" aria-hidden="true"><path d="M4 2h10a1 1 0 0 1 1 1v16l-6-4-6 4V3a1 1 0 0 1 1-1Z"/></svg></button></div><div class="project-title-line"><h3>${esc(p.name)}</h3><span class="repo-name">${esc(p.repo||p.fullName)}</span></div>${p.headline?`<p class="project-headline">${esc(p.headline)}</p>`:''}<p class="project-description">${esc(p.summary||p.description)}</p><div class="use-case"><span class="use-icon" aria-hidden="true">↳</span><span>${esc(p.useCase)}</span></div><div class="project-tags">${(p.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div></div><div class="card-bottom"><div class="metrics">${metrics}${isRepo&&p.language?`<span>${esc(p.language)}</span>`:''}</div><a class="project-link" href="${esc(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${isRepo?'查看 GitHub':'阅读官方原文'} <span>↗</span></a></div>${details}${weekly&&p.components?scoreBreakdown(p):''}${p.scoringVersion==='frontier-cross-source-v1'?frontierScoreBreakdown(p):''}</article>`;
}
function frontierScoreBreakdown(p){return `<details class="score-breakdown"><summary>前沿价值评审 <strong>${Number(p.score).toFixed(2)}</strong> / 100 <span>查看依据 ↓</span></summary><div class="score-body"><p>技术增量 ${esc(p.components.novelty)} · 应用价值 ${esc(p.components.applicability)} · 证据 ${esc(p.components.evidence)} · 近期变化 ${Number(p.components.recency).toFixed(1)}</p>${['novelty','applicability','evidence'].map(key=>'<p>'+esc(p.review[key].reason)+'</p>').join('')}<p>评分为编辑评审，不代表独立复现结果。</p></div></details>`;}
function scoreBreakdown(p){return `<details class="score-breakdown"><summary>开源趋势评分 <strong>${Number(p.score).toFixed(2)}</strong> / 100 <span>查看依据 ↓</span></summary><div class="score-body"><p>候选池百分位：新增关注 ${esc(p.components.attention)} · 平滑增速 ${esc(p.components.momentum)} · Fork 增长 ${esc(p.components.building)}</p><p>七天平滑增速 ${(Number(p.relativeGrowth)*100).toFixed(2)}% · 按 45 / 35 / 20 加权</p><p>本分数仅表示开源增长线索，不与公司技术或研究成果的分数直接比较。</p></div></details>`;}
function currentProjects(){
 if(state.view==='weekly')return state.catalog.weekly?.itemIds ? state.catalog.weekly.itemIds.map(id=>(state.catalog.frontiers||[]).find(p=>p.id===id)).filter(Boolean) : state.catalog.frontierRanking?.ready?state.catalog.frontierRanking.ranked:(state.catalog.frontiers||[]);
 if(state.view==='trending'){
  const report=state.selectedReport||state.reports[0];
  return report?report.projects.map(p=>({...state.catalog.projects.find(x=>x.repo===p.repo),...p})):state.catalog.editorial.map(repo=>state.catalog.projects.find(p=>p.repo===repo)).filter(Boolean);
 }
 let list=allItems().filter(p=>state.view!=='saved'||state.saved.includes(itemKey(p)));
 if(state.category!=='全部')list=list.filter(p=>p.category===state.category);
 if(state.source!=='全部来源')list=list.filter(p=>(p.kind||'开源项目')===state.source);
 const q=state.query.trim().toLowerCase();
 if(q)list=list.filter(p=>[p.name,p.repo,p.fullName,p.organization,p.description,p.useCase,p.category,...(p.tags||[])].join(' ').toLowerCase().includes(q));
 if(state.sort==='stars')list.sort((a,b)=>(b.repo?b.stars:-1)-(a.repo?a.stars:-1));
 if(state.sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
 return list;
}
function render(){
 if(!state.catalog)return;
 const weekly=state.view==='weekly',trending=state.view==='trending',listView=!weekly&&!trending;
 const report=state.selectedReport||state.reports[0];
 const frontierReady=Boolean(state.catalog.frontierRanking?.ready);
 document.querySelectorAll('[data-nav]').forEach(a=>{const active=a.dataset.nav===state.view;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 $('#saved-count').textContent=state.saved.length;
 $('#section-kicker').textContent=weekly?'THE FRONTIER WATCH':trending?'OPEN SOURCE MOMENTUM':state.view==='saved'?'YOUR INSPIRATION SHELF':'THE TECHNOLOGY EXPLORER';
 $('#section-title').innerHTML=(weekly?(state.catalog.weekly?'本周技术更新':frontierReady?'本周前沿精选':'前沿观察'):trending?(report?'开源趋势榜':'开源编辑精选'):state.view==='saved'?'我的收藏':'技术发现')+'<span class="accent-dot">.</span>';
 $('#section-description').textContent=weekly?(state.catalog.weekly?'第 '+state.catalog.weekly.issue+' 期 · 观察窗口 '+state.catalog.weekly.period+' · 发布 '+state.catalog.weekly.publishedAt:'从原始资料里，发现值得借鉴的技术思路。'):trending?(report?report.period+' · GitHub 候选池内增长排名':'七天对比尚未就绪，先阅读三个编辑精选。'):state.view==='saved'?'把值得借鉴的技术，留给未来的自己。':'把公司技术、研究成果与开源工具，放在同一个视野里。';
 $('#weekly-note').hidden=listView||(trending&&Boolean(report))||(weekly&&frontierReady);
 $('#weekly-note').innerHTML=weekly?'<span>编者按</span><p>以下为人工核验的技术观察，按阅读主题编排。核验日期不等于发布日期，<strong>不代表本周热度排名</strong>。</p>':'<span>采样说明</span><p>GitHub 周榜尚未积累完整对比窗口，以下为编辑精选，<strong>不代表本周增长排名</strong>。</p>';
 $('#ranking-preview').hidden=!weekly;
 $('#explore-controls').hidden=!listView;
 $('#archive-button').hidden=!trending;
 document.querySelectorAll('[data-category]').forEach(b=>{const active=b.dataset.category===state.category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 document.querySelectorAll('[data-source]').forEach(b=>{const active=b.dataset.source===state.source;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 const projects=currentProjects();
 $('#results-status').textContent=listView?`找到 ${projects.length} 条技术${state.view==='saved'?' · 收藏保存在当前浏览器':''}`:'';
 if(!projects.length){$('#project-list').innerHTML=state.view==='saved'&&!state.saved.length?'<div class="empty-state"><h3>你的灵感书架，等待第一条发现。</h3><p>点击技术卡片右上角的书签，把它留在这里。</p><a href="#explore">去发现值得借鉴的技术 ↗</a></div>':'<div class="empty-state"><h3>暂时没有匹配的技术</h3><p>换个关键词，或试试其他来源与方向。</p></div>';}
 else $('#project-list').innerHTML=projects.slice(0,listView?state.limit:3).map((p,i)=>card(p,i,trending&&Boolean(report))).join('');
 $('#load-more').hidden=!listView||projects.length<=state.limit;
}
function changeView(){const view=location.hash.slice(1);state.view=['weekly','explore','trending','saved'].includes(view)?view:'weekly';state.category='全部';state.source='全部来源';state.query='';state.sort='default';state.limit=12;$('#search-input').value='';$('#sort-select').value='default';render();}
function openDialog(title,html){$('#dialog-title').textContent=title;$('#dialog-body').innerHTML=html;$('#info-dialog').showModal();}
function openSourceMethodology(){openDialog('开源趋势 · 增长线索',`<p>只比较 GitHub 候选池相隔 7–8 天的快照，增量统一折算为七天。</p><h3>45% 新增关注 · 35% 平滑增速 · 20% Fork 增长</h3><p>平滑增速为七天新增 Star ÷（期初 Star + 200）。各项按候选池百分位加权；相同指标用中位秩，同分依次按 Star 增长、Fork 增长和仓库名称排序。</p><h3>入榜条件</h3><p>七天至少新增 20 Star 或 5 Fork；缺少基线的项目跳过。至少三个项目达标才生成榜单。历史周报保留当时的算法。</p><p>这条榜单只反映开源关注和尝试意愿。它不决定公司技术与研究成果的价值，也不代表真实采用人数。当前${state.reports.length?'已有 '+state.reports.length+' 期周报。':'尚无完整对比数据，展示的是编辑精选。'}</p>`);}
function methodology(){
 if(state.view==='trending')return openSourceMethodology();
 openDialog('前沿观察 · 如何筛选技术',`<p>Gathering 先发现公司官网、研究博客、技术文档与开源社区中的技术，再核验原始资料。没有 Star 的技术，也可以值得关注。</p><h3>30% 技术增量</h3><p>相比已有方案，具体改变了什么机制或能力？由编辑填写判断与依据，不能只引用“领先”之类的宣传。</p><h3>30% 应用价值</h3><p>能解决什么问题？哪些设计值得借鉴？采用需要哪些条件？必须给出具体场景和边界。</p><h3>25% 证据充分度</h3><p>原始文档、论文、代码或可检查的评估是否支撑主张？官方自述与独立验证分开标注，官方来源本身不等于效果已复现。</p><h3>15% 近期变化</h3><p>只有已确认的发布或实质更新日期进入七天窗口。当天发现或核验一篇旧文章，不算新发布。</p><h3>去重与来源多样性</h3><p>同一技术在官网、论文和 GitHub 上出现时，合并为一条。前三中同一家公司最多两条；不足三条满足条件时不凑数。</p><h3>当前状态</h3><p>${state.catalog?.frontierRanking?.ready?'本期已有三条技术完成评审与日期核验，展示前沿精选及得分依据。':'首批条目尚未完成量化评审与发布日期核验，因此页面展示人工核验的观察清单，未生成跨来源数值排名。'}权重是可调整的编辑规则，不是客观质量评分。</p><p>GitHub 的增长算法保留在“开源趋势”栏目，两个分数不混算。</p>`);
}
function sources(){
 if(!state.catalog)return toast('资料仍在加载，请稍后重试。');
 const catalog=state.catalog;
 openDialog('来源目录与核验状态',`<p>已把以下 ${(catalog.sources||[]).length} 个公司官网入口纳入来源目录。目录、页面可访问和具体技术已核验是三个不同状态。</p>${(catalog.sources||[]).map(s=>{const check=catalog.sourceChecks?.checks?.find(c=>c.id===s.id);return `<div class="source-entry"><a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer"><strong>${esc(s.name)}</strong> ↗</a><p>${esc(s.kind)} · ${check?(check.status==='reachable'?'页面访问检查成功':'本次访问检查失败'):'尚无页面访问检查记录'}</p>${check?`<p>${esc(formatTime(check.checkedAt))} CST</p>`:''}</div>`;}).join('')}<h3>已收录内容</h3><p>${(catalog.frontiers||[]).length} 条技术观察经过原始资料核验，借鉴思路为编辑解读；GitHub 候选池 ${catalog.candidateCount} 个，快照采样于 ${esc(formatTime(catalog.sampledAt))} CST。源码仓库仍可在“技术发现”中筛选。</p><h3>更新方式</h3><p>目前是本次人工核验与按需页面检查。每周任务按北京时间周一 09:00 收集和核验新内容，网站成功发布后发送邮件。任务已配置，实际完成情况以页面期号与发布记录为准；来源指纹变化不等于新技术发布。</p><p>收藏保存在当前浏览器，不同步到其他设备。</p>`);
}
$('#about-button').onclick=$('#footer-about').onclick=()=>openDialog('Gathering · AI 的前沿，正在集合。','<p>Gathering 汇聚值得借鉴的 AI 技术，覆盖公司官网、研究博客、技术文档、论文与开源社区。</p><p>我们关注：技术具体改变了什么，能用于什么场景，原始证据是否充分，以及有哪些适用边界。</p><p>第一版多来源内容采用人工核验；开源增长与跨来源技术价值分开呈现。每周更新任务已配置，网站成功发布后发送邮件；本期日期见首页。</p>');
$('#ranking-details-button').onclick=$('#method-button').onclick=methodology;
$('#sources-button').onclick=sources;
$('#close-dialog').onclick=()=>$('#info-dialog').close();
$('#info-dialog').onclick=e=>{if(e.target!==e.currentTarget)return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();};
$('#archive-button').onclick=()=>openDialog('开源历史周报',state.reports.length?'<p>历史周报保留当时的增长排名规则。</p>'+state.reports.map((r,i)=>`<button class="archive-item" data-report="${i}"><span>${esc(r.period)}</span><span>↗</span></button>`).join(''):'<p>还没有完整的七天对比数据。正式生成的开源周报将在这里保留。</p>');
$('#dialog-body').onclick=e=>{const b=e.target.closest('[data-report]');if(!b)return;state.selectedReport=state.reports[Number(b.dataset.report)];$('#info-dialog').close();render();};
$('#category-filters').innerHTML=categories.map(c=>`<button class="filter-chip" data-category="${c}" aria-pressed="${c==='全部'}">${c}</button>`).join('');
$('#source-filters').innerHTML=sourceTypes.map(s=>`<button class="filter-chip" data-source="${s}" aria-pressed="${s==='全部来源'}">${s}</button>`).join('');
$('#category-filters').onclick=e=>{const b=e.target.closest('[data-category]');if(!b)return;state.category=b.dataset.category;state.limit=12;render();};
$('#source-filters').onclick=e=>{const b=e.target.closest('[data-source]');if(!b)return;state.source=b.dataset.source;state.limit=12;render();};
$('#search-input').oninput=e=>{state.query=e.target.value;state.limit=12;render();};
$('#sort-select').onchange=e=>{state.sort=e.target.value;state.limit=12;render();};
$('#load-more').onclick=()=>{state.limit+=12;render();};
$('#project-list').onclick=e=>{const b=e.target.closest('[data-save]');if(!b)return;const id=b.dataset.save;const next=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];try{localStorage.setItem('signal-saved',JSON.stringify(next));state.saved=next;render();toast(next.includes(id)?'已收藏，给未来留一条灵感。':'已取消收藏');}catch{toast('浏览器无法保存收藏，请检查存储设置。');}};
window.addEventListener('hashchange',changeView);
window.addEventListener('storage',e=>{if(e.key==='signal-saved'){state.saved=readSaved();render();}});
async function load(){try{
 const [a,b]=await Promise.all([fetch('data/catalog.json'),fetch('data/reports.json')]);if(!a.ok||!b.ok)throw Error('HTTP error');
 const catalog=await a.json(),reports=await b.json();if(!Array.isArray(catalog.projects)||!Array.isArray(catalog.frontiers)||!Array.isArray(reports))throw Error('Invalid data');
 state.catalog=catalog;state.reports=reports;
 $('#data-status').textContent='多来源观察 · 人工核验';
 $('#sample-time').textContent=`${catalog.sources.length} 个官网入口 · ${catalog.frontiers.length} 条技术观察 · GitHub 候选 ${catalog.candidateCount} 个`;
 changeView();
 }catch{
 $('#data-status').textContent='数据暂时无法读取';$('#sample-time').textContent='请检查连接后重试';
 $('#project-list').innerHTML='<div class="empty-state"><h3>技术资料加载失败</h3><p>请通过网页服务器访问本站，或稍后重试。</p><button class="primary-button" id="retry-button">重新加载 ↻</button></div>';
 $('#retry-button').onclick=load;
 }}
load();
