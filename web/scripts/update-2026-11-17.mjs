import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const file=new URL('content/frontiers.json',root);
const content=JSON.parse(await fs.readFile(file,'utf8'));
const definitions=[
 ['antigravity-teamwork-20261113','Antigravity /teamwork','Google Research','智能体','把生成、反驳和验证组织成长任务工作流。','Google 分享多智能体在科研与系统工程中的应用，并开放部分工作流；专门的验证器检查候选结果，独立上下文的评审者复核输出。','用于有明确测试、证明检查器或性能指标的工程任务；先确定验收条件，再探索候选方案。','借鉴思路：把候选生成与验证分开，长任务交接时限制上下文，保留可复查的结果。','本文为官方案例与方法介绍，未独立复现；部分专门工作流仍将陆续开放，不能假定所有能力均已可用。','https://research.google/blog/advancing-science-engineering-with-antigravitys-teamwork-feature/',['多智能体','长任务','验证器']],
 ['anthropic-safety-evaluations-20261113','Building strong safety evaluations','Anthropic','智能体安全','安全评测要测真实行为，也要检查正常请求被误拒的情况。','Anthropic 发布安全评测设计、运行与报告建议，强调真实多轮场景、领域专家评分规则、评测器校准及可复现记录。','为聊天助手设计覆盖逐步升级意图的多轮测试，同时搭配正常请求检查过度拒绝。','借鉴思路：先明确评测问题，再设计样本；对整段对话评分，分开记录安全表现与误拒。','这是工程方法建议，不是新的通用安全保证；评测需结合具体产品环境，模型评分器仍需人工校准。','https://www.anthropic.com/research/building-strong-safety-evaluations',['多轮评测','评分校准','可复现']],
 ['deepmind-weather-datasets-20261113','PARDIG & SatWeave','Google DeepMind','基础设施','开放天气模型背后的观测数据，让下游研究能从数据开始。','Google DeepMind 开放 SatWeave 卫星观测与 PARDIG 降水数据的历史档案和实时数据入口，支持天气、水文与气候应用。','探索天气观测融合、降水研究与下游模型开发；先核对数据时间范围、分辨率与访问条件。','借鉴思路：将实时观测与历史训练档案一起提供，让下游团队可以复查数据并建立可比较的评估。','性能结论来自官方评估，本站未独立复现；分辨率与延迟限制需要按具体应用评估，不能直接等同于本地预警能力。','https://deepmind.google/blog/opening-the-datasets-behind-our-ai-weather-models/',['开放数据','天气AI','观测融合']]
];
const items=definitions.map(([id,name,organization,category,headline,description,useCase,takeaway,limitation,url,tags])=>({id,canonicalId:id,name,fullName:name,organization,kind:category==='基础设施'?'研究成果':'公司技术',category,headline,description,useCase,takeaway,limitation,url,tags,status:'本期新收录 · 官方原文核验',publishedAt:'2026-11-13',verifiedAt:'2026-11-17',review:null,sources:[{label:organization+' 官方原文',url,type:'research',primary:true}]}));
content.items=[...items,...content.items.filter(x=>!items.some(n=>n.id===x.id))];
content.verifiedAt='2026-11-17';
content.weekly={issue:'2026-11-17',period:'2026-11-10 — 2026-11-17',publishedAt:'2026-11-17',itemIds:items.map(x=>x.id)};
await fs.writeFile(file,JSON.stringify(content,null,2)+'\n');
await fs.mkdir(new URL('content/weekly/',root),{recursive:true});
await fs.writeFile(new URL('content/weekly/2026-11-17.md',root),'# Gathering · 2026-11-17\n\n观察窗口：2026-11-10 — 2026-11-17。以下均为 11 月 13 日官方发布，按主题编排，不是量化排名。\n\n'+items.map(x=>`## ${x.name}\n\n${x.description}\n\n用途：${x.useCase}\n\n${x.takeaway}\n\n边界：${x.limitation}\n\n发布：${x.publishedAt} · 核验：${x.verifiedAt}\n\n[官方原文](${x.url})\n`).join('\n'));
console.log('Prepared issue 2026-11-17 with 3 verified items.');
