# Gathering · 多来源技术观察

Gathering 发现值得借鉴的 AI 技术，范围包括公司官网、研究博客、技术文档、论文与开源社区。内容不以是否有 GitHub 仓库为入选前提。

## 当前页面
- 前沿观察：NVIDIA APF、DeepMind AlphaEvolve、Microsoft Agent Framework，附原始来源、用途解读、适用边界和日期。
- 技术发现：三条技术观察与 82 个 GitHub 候选可一起搜索，按公司技术、研究成果、开源项目筛选。
- 开源趋势：原 GitHub 增长算法保留为独立栏目。
- 收藏：兼容原有仓库收藏，也支持没有 repo 字段的技术条目。

## 来源与更新
内容与来源目录由 content/frontiers.json 管理。来源包括 NVIDIA、Google DeepMind、Microsoft、Qwen、ByteDance Seed、Anthropic。

执行 `node scripts/check-sources.mjs` 按需检查配置的官方页面，记录可访问性与正文指纹。结果写入 content/source-checks.json。指纹变化不代表发布了新技术，访问成功也不代表技术内容或效果已被核验。当前没有部署定时任务、自动摘要发布或邮件发送。

本次检查 NVIDIA 与 Microsoft 成功，其他四个直连失败；DeepMind 条目通过官方原文检索核验。不得将目录登记说成持续监控或全网覆盖。

## 排名
跨来源评审使用技术增量 30%、应用价值 30%、证据充分度 25%、近期变化 15%。前面三项必须有编辑评分及理由、原始来源，并确认最近七天的发布或实质更新日期。同一技术去重，每家机构在前三中最多两条。未满足条件时不生成数值排名。

首批三条观察没有量化评审，APF 和 Microsoft 条目的发布日期未确认；AlphaEvolve 原文发布于 2025-05-14。因此首页是观察清单，不是本周新技术排行榜。当前核验时间不能代替发布时间。

开源趋势另用 GitHub v2 算法，见 RANKING.md。两种分数不能直接混算。

## 本地启动与生产构建
在 web 目录执行 `node build.mjs`，再运行 `node server.mjs`，浏览器打开 http://127.0.0.1:4173 。dist 目录可静态托管。

构建选择最新 GitHub 快照，优先使用上级 data，独立仓库使用 source-data。采集器 scripts/collect.mjs 可用环境变量 GATHERING_DATA_DIR 指定持久目录。

## 验证
`node --test lib/ranking.test.mjs lib/frontier-ranking.test.mjs`

已验证跨来源去重、旧资料排除、缺失评审不计分、机构多样性、Star 不影响公司技术评审，以及原 GitHub 七项测试。浏览器验证 APF 详情、收藏、来源筛选、开源栏目与来源检查状态。
