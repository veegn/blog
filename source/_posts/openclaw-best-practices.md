---
title: OpenClaw 2026 年 2 月安全风暴与实战最佳实践
date: 2026-02-07
updated: 2026-02-28 13:20:00
tags:
  - OpenClaw
  - AI Skills
  - 安全
  - ClawHub
  - 供应链安全
  - 技术趋势
categories:
  - 技术教程
abbrlink: openclaw-guide
description: 2026 年 2 月，OpenClaw 生态经历了从恶意 Skills 供应链攻击到 ClawJacked 漏洞的全面安全洗礼。本文深度解析最新安全事件、版本更新、VirusTotal 集成，并给出可落地的安全加固最佳实践。
ai_generated: true
---

> 🤖 **AI 生成文章声明**：本文由 OpenClaw 自动化脚本抓取全球最新动态并深度分析生成。
> 📅 **实战数据更新**：2026 年 2 月 28 日

![OpenClaw Skills 生态概览](/images/openclaw/openclaw-awesome-skills-banner.png)

## 一、2 月安全风暴回顾：OpenClaw 的"成人礼"

2026 年 2 月对 OpenClaw 来说是历史性的一个月。项目 GitHub 星标突破 **21.5 万**，但随之而来的是一系列严肃的安全挑战，让整个社区进入了快速成熟期。

### 1. ClawHub 恶意 Skills 供应链攻击

**事件概览**：自 1 月 27 日起，安全研究人员陆续发现 ClawHub 上至少 **341 个恶意 Skills**（早期报告为 230 个，后续 Snyk 的 ToxicSkills 研究将数字提升至 1,467 个恶意载荷），包含加密货币窃取恶意软件、远程代码执行后门（base64 编码的 `curl|bash` 调用）、以及数据外泄行为。

*   **The Hacker News** 报道：ClawHub 默认开放上传，唯一限制是发布者需要一个超过一周的 GitHub 账号。
*   **Snyk 研究发现**：约 **36% 的 Skills 存在 Prompt 注入风险**，7.1% 的 Skills 在明文状态下暴露敏感凭证。
*   **1Password 安全团队** 指出：MCP 协议本身不是安全保障，恶意 Skill 可以通过社会工程、直接 Shell 指令或捆绑代码绕过它。

**教训**：Skills 生态的开放性是双刃剑。**不要盲目安装来源不明的 Skill。**

### 2. ClawJacked 漏洞 (CVE-2026-25253)

**这是 2 月最严重的安全事件。** Oasis Security 研究团队披露了名为 **"ClawJacked"** 的漏洞链：

*   **攻击方式**：任意网站可以通过 localhost WebSocket 连接直接劫持用户的 OpenClaw Agent。开发者只需不小心访问一个恶意网页，隐藏脚本即可悄悄建立 WebSocket 连接，与后台运行的 AI 代理通信。
*   **CVSS 评分**：8.8（高危）
*   **影响范围**：一旦被劫持，攻击者可获得 Agent 的全部高权限——自动化工作流、代码库访问、集成凭证等。
*   **修复**：已在 **v2026.2.25** 中修复。**所有用户必须立即升级。**

```bash
# 检查当前版本
openclaw --version

# 升级到最新版
npm update -g openclaw
# 或
openclaw update
```

### 3. OpenClaw × VirusTotal：生态安全升级

作为对恶意 Skills 事件的直接回应，OpenClaw 与 **VirusTotal** 达成合作：

*   **每个上传到 ClawHub 的 Skill 都会被哈希并提交至 VirusTotal 进行扫描**
*   扫描结果分三级：✅ 良性（正常使用）、⚠️ 可疑（显示警告）、❌ 恶意（完全阻止下载）
*   **所有存量 Skills 每日重新扫描**，以检测更新中引入的威胁
*   VirusTotal Code Insight 不仅检查文件签名，还分析 Skill 是否下载执行外部代码、访问敏感数据、执行网络操作或嵌入胁迫 Agent 的指令

> ⚠️ **但请注意**：Reddit 上有研究者指出，部分恶意 Skill 在 VirusTotal 上仍为 **0/64 检出**。自动扫描是第一道防线，不是最后一道。

---

## 二、版本快报：v2026.2.21 → v2026.2.25 关键更新

2 月份 OpenClaw 保持了惊人的发布节奏，累计 **40+ 安全修复**。以下是最值得关注的变更：

### v2026.2.25（2 月 26 日）— 安全加固里程碑

| 领域 | 变更 |
|------|------|
| **Heartbeat** | DM 投递恢复；新增 `agents.defaults.heartbeat.directPolicy`（allow/block）配置 |
| **Subagent** | 完成消息分发重构为显式队列/直投/降级状态机；修复冷启动下的通道插件注册问题 |
| **安全** | 浏览器 SSRF 策略默认切换为 `trusted-network` 模式；`env.*` 动态密钥在配置快照中自动脱敏；混淆命令执行前要求显式审批；ACP 客户端权限要求受信工具 ID 与限定范围的读权限 |
| **品牌** | 全面完成从 `bot.molt` 到 `ai.openclaw` 的标识迁移（launchd、iOS bundle、日志子系统） |
| **Onboarding** | 明确 OpenClaw 为"单人信任边界"设计，共享/多用户部署需显式加固 |
| **外部密钥** | 新增 `openclaw secrets` 完整工作流（audit → configure → apply → reload），支持运行时快照激活 |

### v2026.2.23（2 月 23 日）— Claude Opus 4.6 支持

*   新增 **Claude Opus 4.6** 模型支持
*   新增 **Moonshot Kimi 视频分析** 集成
*   新增 **Kilo Gateway** 集成
*   Skills 打包系统拒绝符号链接逃逸和图片画廊中的 XSS 漏洞 Prompt
*   OTEL 诊断中的 API 密钥在导出前自动脱敏

### v2026.2.22 — 会话维护增强

*   新增 `openclaw sessions cleanup` 命令
*   磁盘预算控制：`session.maintenance.maxDiskBytes` / `highWaterBytes`
*   更安全的转录/归档清理和运行日志保留策略

### v2026.2.21 — 新供应商与路由

*   新增 **火山引擎（豆包/Doubao）** 和 **BytePlus** 模型提供商支持
*   新增 **Mistral** 提供商支持，包含记忆嵌入和语音功能
*   可选内置自动更新器（默认关闭）
*   新增 `openclaw update --dry-run` 命令

---

## 三、安全加固最佳实践清单

基于 2 月的安全事件和 Microsoft、Cisco、Kaspersky 等安全团队的分析，整理以下可落地的加固建议：

### 🔒 基础安全（必做）

```bash
# 1. 立即升级到 v2026.2.25+
openclaw update

# 2. 运行内置安全检查
openclaw doctor --fix
openclaw security audit

# 3. 检查已安装的 Skills
clawhub list          # 列出所有已安装 Skills
clawhub audit         # 审计 Skills 来源与安全状态
```

### 🛡️ Skills 供应链安全

1.  **分级信任管理**：
    *   `~/.openclaw/skills/`（Local）— 仅放置经过审计的高信任 Skills
    *   项目工作区 `./skills/`（Workspace）— 实验性 Skills，权限自动隔离
2.  **安装前检查**：
    *   在 ClawHub 上查看 VirusTotal 扫描结果
    *   检查 Skill 的更新频率、Issue 处理速度、版本历史
    *   查看源代码，对含有 `curl|bash`、base64 编码、外部二进制下载的 Skill **保持高度警惕**
3.  **红线规则**：文档模糊、代码不透明的 Skill = 红旗信号，不是"小众魅力"

### 🌐 网络与运行时安全

*   **确认 SSRF 策略**：v2026.2.23 起浏览器 SSRF 默认为 `trusted-network`，如有私有网络需求需显式配置
*   **不要暴露 Gateway 到公网**：Kaspersky 报告指出大量 OpenClaw 实例暴露在互联网上
*   **使用外部密钥管理**：v2026.2.25 新增 `openclaw secrets` 工作流（audit → configure → apply → reload），支持运行时快照激活

### 📋 迁移检查清单

如果你从旧版本升级，注意以下 Breaking Changes：

- [ ] 确认浏览器 SSRF 策略配置（`openclaw doctor --fix` 可自动迁移）
- [ ] 如需保持旧版 Heartbeat DM 屏蔽行为，设置 `agents.defaults.heartbeat.directPolicy: "block"`
- [ ] 检查品牌标识迁移：`bot.molt` → `ai.openclaw`（launchd、bundle ID）

---

## 四、从"全能 Agent"到"原子化 Skills"：趋势不变

尽管安全风波不断，OpenClaw 的 Skills 生态仍在加速膨胀。截至 2 月底：

*   **ClawHub 注册 Skills 数**：5,700+（2 月 7 日为 5,705）
*   **awesome-openclaw-skills 收录**：2,868 个精选 Skills

### 三大持续热门方向

1.  **跨模态生产力**：`comfy-ai`（Stable Diffusion 对话调参）、`remotion-video-toolkit`（React → 视频）
2.  **GUI 与 OS 级操作**：`computer-use`（无头服务器 GUI 控制）、新的 `unbrowse` 浏览器自动化（可视元素检测）
3.  **DevOps 自愈**：`cloudflare`（D1/KV/Worker 管理）、`cron-backup`（定时备份与版本跟踪）、`linux-service-triage`（专业故障诊断）

### AgentSkills 标准化

OpenClaw 全面支持 Anthropic AgentSkills 标准，Skills 可在 Claude Code、Cursor 等工具间无缝迁移。同时，火山引擎（Z.AI）等平台也已接入 OpenClaw Skills 生态。

---

## 五、Vibe Coding：从概念到日常

**"Professional Vibe Coder"** 在 2 月登顶科技热搜。OpenClaw 作为 Vibe Coding 的最佳载体，其核心优势在于：

*   **深度上下文**：`MEMORY.md` + `USER.md` 构建持久记忆
*   **随时随地反馈**：通过 Telegram/WhatsApp 在散步时就能指导 AI 编码
*   **原子化技能支撑**：组合不同 Skills 快速验证创意

但在安全意识增强的今天，Vibe Coder 还需要掌握一项新技能：**审计你的 Skills 供应链**。

---

## 六、结语：在速度与安全之间

2 月是 OpenClaw 社区的分水岭。恶意 Skills 攻击和 ClawJacked 漏洞让所有人意识到：**个人 AI Agent 拥有的权限等级，要求我们以对待生产服务器的严肃态度来对待它。**

好消息是，OpenClaw 团队的响应速度极快——从 VirusTotal 集成到 40+ 安全修复，从 SSRF 默认策略升级到外部密钥管理，安全正在成为平台的一等公民。

**行动建议**：
1.  立即升级到 v2026.2.25+
2.  运行 `openclaw doctor --fix` 和 `openclaw security audit`
3.  审计你已安装的所有 Skills
4.  关注 [OpenClaw 安全公告](https://github.com/openclaw/openclaw/security) 和 [CHANGELOG](https://github.com/openclaw/openclaw/blob/main/CHANGELOG.md)

---
**延伸阅读：**
*   [Awesome OpenClaw Skills 目录](https://github.com/VoltAgent/awesome-openclaw-skills)
*   [ClawHub 技能注册中心](https://www.clawhub.com/)
*   [OpenClaw 官方安全指南](https://docs.openclaw.ai/gateway/configuration)
*   [ClawJacked 漏洞详情（Oasis Security）](https://www.oasis.security/blog/openclaw-vulnerability)
*   [Bitdoze 安全加固指南：CVE-2026-25253 与 40+ 修复](https://www.bitdoze.com/openclaw-security-guide/)
*   [Microsoft：安全运行 OpenClaw 的身份、隔离与运行时风险](https://www.microsoft.com/en-us/security/blog/2026/02/19/running-openclaw-safely-identity-isolation-runtime-risk/)
