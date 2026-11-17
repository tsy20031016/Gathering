import fs from 'node:fs/promises';
import {RANKING} from './lib/ranking.mjs';
import {FRONTIER_RANKING,rankFrontiers} from './lib/frontier-ranking.mjs';
const frontiers=JSON.parse(await fs.readFile(new URL('./content/frontiers.json',import.meta.url),'utf8'));
let sourceChecks={checks:[]};try{sourceChecks=JSON.parse(await fs.readFile(new URL('./content/source-checks.json',import.meta.url),'utf8'));}catch{}
const frontierRanking=rankFrontiers(frontiers.items);

const inputDir = await fs.access(new URL('../data/',import.meta.url)).then(() => new URL('../data/',import.meta.url)).catch(() => new URL('./source-data/',import.meta.url));
const snapshotFiles=(await fs.readdir(inputDir)).filter(name=>/^snapshot-.*\.json$/.test(name)).sort();
if(!snapshotFiles.length) throw new Error('No source snapshots available');
const snapshot=JSON.parse(await fs.readFile(new URL(snapshotFiles.at(-1),inputDir),'utf8'));
const editorial = {
 'langflow-ai/langflow':{category:'智能体',name:'Langflow',headline:'把想法连成线，让 AI 工作流真正跑起来。',description:'通过可视化方式连接模型、提示词、数据和工具，搭建 AI 应用工作流。',useCase:'先试试：做一个能查询文档、调用工具的工作助手。',audience:'适合想快速验证 AI 应用的开发者与产品经理',tags:['可视化工作流','低代码'],language:'Python',reading:'4 分钟'},
 'infiniflow/ragflow':{category:'知识库',name:'RAGFlow',headline:'让 AI 读懂你的文档，再给出有依据的答案。',description:'围绕文档解析和检索增强生成（RAG），构建基于自有资料的问答体验。',useCase:'先试试：导入几份项目文档，搭建一个个人知识库。',audience:'适合处理文档、研究资料和企业知识的团队',tags:['RAG','文档理解'],language:'Python',reading:'5 分钟'},
 'unslothai/unsloth':{category:'模型工具',name:'Unsloth',headline:'从使用模型，到尝试训练自己的模型。',description:'提供大语言模型微调工具，帮助开发者探索针对特定任务的模型训练。',useCase:'先试试：用一小份标注数据，探索特定风格的问答模型。',audience:'适合具备 Python 与模型训练基础的开发者',tags:['模型微调','训练'],language:'Python',reading:'6 分钟'},
 'OpenHands/OpenHands':{category:'智能体',name:'OpenHands',description:'探索让软件开发智能体参与代码编写与开发任务。',useCase:'从一个隔离的测试仓库开始，体验 AI 辅助开发。',tags:['代码智能体','开发效率'],language:'Python'},
 'deepset-ai/haystack':{category:'知识库',name:'Haystack',description:'用于构建检索、问答及大语言模型应用的开源框架。',useCase:'尝试组合检索器和生成模型，构建文档问答管道。',tags:['检索','应用框架'],language:'Python'},
 'milvus-io/milvus':{category:'基础设施',name:'Milvus',description:'面向向量相似性检索的开源数据库。',useCase:'探索语义搜索、相似内容推荐与知识库向量检索。',tags:['向量数据库','语义搜索'],language:'Go'}
};
const projects = Object.entries(snapshot.repos).map(([repo,p])=>({id:repo,repo,kind:'开源项目',name:repo.split('/')[1],category:'其他 AI',description:'已纳入 AI 主题候选池。用途、许可证及部署条件请以项目仓库说明为准。',useCase:'打开 GitHub，阅读 README 并判断是否适合你的场景。',tags:['候选项目'],...editorial[repo],...p,url:`https://github.com/${repo}`}));
const catalog = {weekly:frontiers.weekly,frontiers:frontiers.items,sources:frontiers.sources,verifiedAt:frontiers.verifiedAt,frontierSpec:FRONTIER_RANKING,frontierRanking,sourceChecks,sampledAt:snapshot.at,candidateCount:projects.length,projects,ranking:RANKING,editorial:['langflow-ai/langflow','infiniflow/ragflow','unslothai/unsloth']};
await fs.writeFile(new URL('dist/data/catalog.json',import.meta.url),JSON.stringify(catalog,null,2));
let reports=[];
for(const file of await fs.readdir(inputDir)) {
 if(!/^report-.*\.json$/.test(file)) continue;
 const report=JSON.parse(await fs.readFile(new URL(file,inputDir),'utf8'));
 if(!report.demo && Array.isArray(report.projects)) reports.push(report);
}
reports.sort((a,b)=>b.generatedAt.localeCompare(a.generatedAt));
await fs.writeFile(new URL('dist/data/reports.json',import.meta.url),JSON.stringify(reports.slice(0,52),null,2));
console.log(`Built ${projects.length} candidates; ${reports.length} weekly reports.`);
