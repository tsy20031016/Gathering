# Gathering

Gathering 每周整理值得借鉴的 AI 公司技术、研究成果和开源工具。网页源码、编辑内容和构建工具位于 [web](web/README.md)，微信小程序原型位于 [miniprogram](miniprogram/)。

## 网页运行与部署

需要 Node.js 22 或更新版本。从仓库根目录运行以下命令：

```sh
npm --prefix web run build
npm --prefix web start
```

在浏览器打开 http://127.0.0.1:4173。GitHub Pages 的发布源选用 GitHub Actions 后，[部署工作流](.github/workflows/pages.yml)会在推送到 `main` 时运行测试、构建并发布 `web/dist`。

## 微信小程序原型

用微信开发者工具导入本目录，选择测试号即可查看演示页面。实际 AppID 在 project.config.json 配置。

## 当前已实现
- 原生微信页面：前三名、用途说明、增长指标、项目链接复制、本地收藏。
- 从 HTTPS JSON 地址加载周报、保留当前设备浏览过的最近 12 期。
- GitHub 候选发现、每日快照、7–8 天窗口增长排名脚本。
- 微信订阅授权入口；未配置时明确提示尚未接通。

## 数据运行
需要 Node.js 22 或更新版本。执行 `node collect.mjs`，可通过环境变量 GITHUB_TOKEN 提供令牌。密钥只能放服务端，禁止放小程序。

每天运行一次并持久保存 data 目录。首次仅保存基线，积累七天后生成 data/latest.json 及归档。每周一北京时间 09:00 可从当天已成功生成的周报发布一期；定时器尚未部署。生产环境应先完成中文摘要审核，再发布到 HTTPS 静态存储，将地址填到 miniprogram/config.js 的 reportUrl，并在微信后台配置合法请求域名。

候选池来自 llm、ai-agents、generative-ai、rag 各 30 个最近更新项目，筛除未识别许可证及归档项目。它并非全网榜单，也不能保证覆盖所有开源项目。新发现项目没有七天基线时不参加排名。采集失败直接报错，不生成部分榜单。首次运行时间可影响窗口精度；当前使用 UTC 日期标注采样期。

当前采用 Gathering 前沿发现 v2：45% 新增 Star、35% 平滑相对增速、20% 新增 Fork，按七天归一化并设置最低活动门槛。细节及局限见 RANKING.md。没有真实采用量或社区讨论指标；Star 和 Fork 仅是代理信号。

## 推送上线待办
1. 注册微信小程序，确认主体、类目和可用消息模板。普通一次性订阅不能等同于永久周更订阅。
2. 配置 subscribeTemplateId；当前按钮只调用微信授权接口，没有服务端用户记录。
3. 增加 wx.login 与服务端 code2Session，安全存储 openid、授权状态、撤销状态。
4. 建立服务端发送任务：匹配已审核模板字段，链接到本期周报，按用户及期号去重，处理授权失效与发送失败。微信 secret 只放服务端。
5. 若业务类目无法支持预期持续通知，另行选择用户同意的邮件或企业微信机器人渠道。

## 验证与限制
可用 `node --check collect.mjs` 检查采集脚本。此项目未在微信开发者工具或真机测试，未配置真实榜单服务、定时任务和消息发送，也未发布。演示项目和数字均为虚构。

参考：
- 微信订阅消息：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/subscribe-message.html
- GitHub 搜索接口：https://docs.github.com/en/rest/search/search

## 多来源升级
Gathering 现覆盖公司技术、研究成果与开源工具。首页使用前沿观察清单；GitHub v2 算法仅用于“开源趋势”。跨来源规则和本次检查状态见 web/README.md。自动扫描与邮件尚未启用。
