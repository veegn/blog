---
title: OpenClaw 从零到一配置部署完整教程
date: 2026-03-08
tags:
  - OpenClaw
  - AI Agent
  - 部署教程
  - 自动化
categories:
  - 技术教程
abbrlink: openclaw-deployment
description: 从零开始配置部署 OpenClaw AI Agent，基于 2026 年当前官方推荐路径，涵盖 onboard、模型认证、Telegram 接入、技能安装、定时任务设置与常见问题排查。
---

# OpenClaw 从零到一配置部署完整教程

> 📦 **版本信息**：本文基于 OpenClaw v2026.3.2 编写  
> 🕒 **更新时间**：2026 年 3 月 8 日  
> 🔗 **官方仓库**：https://github.com/openclaw/openclaw  
> 📚 **官方文档**：https://docs.openclaw.ai

---

## 一、OpenClaw 是什么？

OpenClaw 是一个**多通道 AI 代理网关系统**，可以让 AI Agent 通过 Telegram、WhatsApp、Discord 等消息平台与你交互，同时支持：

- ✅ **多模型支持**：Claude、Gemini、Qwen 等 LLM 自动故障转移
- ✅ **多通道消息**：Telegram、WhatsApp、Discord、Slack 等
- ✅ **技能系统**：GitHub 操作、天气查询、笔记管理等 50+ 内置技能
- ✅ **定时任务**：自动执行周期性任务（日报、监控、备份等）
- ✅ **设备管理**：配对 macOS/iOS/Android 设备，远程控制
- ✅ **持久记忆**：会话历史、长期记忆、上下文压缩

**适用场景**：
- 个人 AI 助手（通过 Telegram 随时对话）
- 自动化任务执行（定时抓取、数据同步）
- 团队协作机器人（GitHub PR 提醒、CI 状态通知）
- 智能家居控制（集成 Home Assistant）

---

## 二、环境准备

### 2.1 系统要求

| 系统 | 最低配置 | 推荐配置 |
|------|---------|---------|
| **Linux** | Ubuntu 20.04+, 2GB RAM, 10GB 磁盘 | Ubuntu 22.04+, 4GB RAM, 20GB 磁盘 |
| **macOS** | macOS 12+, 2GB RAM | macOS 14+, 8GB RAM |
| **Windows** | WSL2 (Ubuntu 20.04+) | WSL2 (Ubuntu 22.04+) |
| **Docker** | 可选 | 推荐（隔离运行） |

**Node.js 版本要求**：Node.js 24 推荐；Node.js 22.14+ 兼容。

### 2.2 安装 Node.js

**Linux (使用 nvm 推荐)**:
```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 重启终端或执行
source ~/.bashrc  # 或 source ~/.zshrc

# 安装 Node.js 24
nvm install 24
nvm use 24
nvm alias default 24

# 验证
node --version  # 应显示 v24.x.x
npm --version   # 应显示 10.x.x
```

**macOS (使用 Homebrew)**:
```bash
brew install node@24
```

**Windows (WSL2)**:
```bash
# 在 WSL2 中执行 Linux 安装步骤
```

### 2.3 安装 OpenClaw

```bash
# 全局安装（推荐）
npm install -g openclaw

# 验证安装
openclaw --version

# 查看帮助
openclaw --help
```

**预期输出**:
```
🦞 OpenClaw 2026.3.2 (85377a2)
Usage: openclaw <command> [options]

Commands:
  gateway          Start the gateway daemon
  configure        Run the setup wizard
  models           Manage model providers
  channels         Manage channel plugins
  skills           Manage skills
  cron             Manage scheduled tasks
  ...
```

---

## 三、初始化配置

### 3.0 当前最推荐的首次安装路径

如果你是第一次装 OpenClaw，官方现在更推荐直接走 `onboard`，而不是一上来手动拼配置。

```bash
# 首次安装推荐
openclaw onboard --install-daemon

# 安装完成后打开控制台
openclaw dashboard
```

这条路径会把下面几件事串起来：

1. 初始化工作区
2. 配置模型与认证
3. 配置 Gateway
4. 安装后台服务
5. 打开浏览器控制台

如果你后面想补配某一块，再用 `openclaw configure` 即可。

### 3.1 运行配置向导

```bash
openclaw configure
```

配置向导会交互式引导你完成：

1. **工作区设置**（默认 `~/.openclaw/workspace`）
2. **模型提供商认证**（Google、Qwen 等）
3. **通道配置**（Telegram、WhatsApp 等）
4. **网关设置**（端口、绑定地址）

**不想用交互式？** 可以手动编辑配置文件（见 3.3 节）。

### 3.2 创建工作区

配置向导会自动创建以下目录结构：

```
~/.openclaw/
├── workspace/           # 工作区（你的文件）
│   ├── AGENTS.md        # Agent 行为指南
│   ├── SOUL.md          # Agent 人格设定
│   ├── USER.md          # 用户信息
│   ├── MEMORY.md        # 长期记忆
│   ├── HEARTBEAT.md     # 心跳任务配置
│   ├── memory/          # 每日记忆文件
│   └── tools/           # 自定义工具
├── openclaw.json        # 主配置文件
├── credentials/         # 认证凭证（加密存储）
└── logs/                # 日志文件
```

### 3.3 手动配置（可选）

如果跳过向导，可以手动编辑 `~/.openclaw/openclaw.json`：

```json5
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "google/gemini-3.1-pro-preview",
        "fallbacks": [
          "qwen/qwen3-coder-plus",
          "google/gemini-3-flash-preview"
        ]
      },
      "workspace": "/home/your-user/.openclaw/workspace"
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "YOUR_BOT_TOKEN",
      "dmPolicy": "pairing"
    }
  },
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "lan",
    "auth": {
      "mode": "token",
      "token": "your-secure-token-here"
    }
  }
}
```

**注意**：这里更准确地说是“示意配置”。`openclaw.json` 在实际使用里按 JSON5 习惯更自然，因为很多教程示例会带注释；如果你直接复制带注释的内容，记得确认当前环境支持的格式。

---

## 四、模型认证配置

OpenClaw 支持多种 LLM 提供商，推荐至少配置 2 个以实现故障转移。

### 4.1 Google Gemini API / Gemini CLI

如果你只是想先把 OpenClaw 跑起来，Google 这一侧目前更常见的是两条路：

- `google`：走 Gemini API Key
- `google-gemini-cli`：走 Gemini CLI OAuth（非官方集成，需本机已安装 `gemini`）

```bash
# 方案 A：Gemini API Key（更稳）
openclaw onboard --auth-choice gemini-api-key

# 方案 B：Gemini CLI OAuth（需要本机先安装 gemini）
openclaw models auth login --provider google-gemini-cli --set-default
```

如果你走 Gemini CLI OAuth，需要先确保本机有 `gemini` 命令，例如：

```bash
npm install -g @google/gemini-cli
```

**验证状态**:
```bash
openclaw models list
```

**预期输出**:
```
Model                                      Input      Ctx      Local Auth  Tags
google/gemini-3.1-pro-preview              text+image 1048k    no    yes   default
google/gemini-3-flash-preview              text+image 1048k    no    yes   configured
```

### 4.2 Qwen（当前建议使用 qwen）

```bash
# 使用 onboarding 配置 Qwen
openclaw onboard --auth-choice qwen
```

**注意**：旧文里常见的 `qwen-portal` / `portal.qwen.ai` 这条免费 OAuth 集成现在已经不是当前推荐路径了。新教程里建议直接按 `qwen` 提供商去配。

### 4.3 配置故障转移

编辑 `~/.openclaw/openclaw.json`：

```json5
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "google/gemini-3.1-pro-preview",
        "fallbacks": [
          "qwen/qwen3-coder-plus",
          "google/gemini-3-flash-preview"
        ]
      }
    }
  }
}
```

**故障转移逻辑**：
1. 优先使用主模型
2. 主模型失败 → 尝试 Qwen Coder
3. Qwen 失败 → 尝试 Gemini Flash
4. 全部失败 → 返回错误给用户

---

## 五、消息通道配置

### 5.1 Telegram 通道（推荐）

**优势**：免费、稳定、API 友好、支持机器人

#### 步骤 1: 创建 Telegram Bot

1. 打开 Telegram，搜索 `@BotFather`
2. 发送 `/newbot` 创建机器人
3. 按提示设置机器人名称和用户名
4. 获取 Bot Token（格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

#### 步骤 2: 配置 OpenClaw

编辑 `~/.openclaw/openclaw.json`：

```json5
{
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
      "dmPolicy": "pairing",
      "groups": {
        "*": {
          "requireMention": true
        }
      }
    }
  }
}
```

**配置说明**:
| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `botToken` | 机器人 Token | 从 BotFather 获取 |
| `dmPolicy` | 私聊策略 | `pairing`（默认，首次私聊需配对） |
| `groups.*.requireMention` | 群聊是否需要 @ 机器人 | `true` |

补充说明：

- Telegram 通道本身不需要你再额外写一段 `plugins.entries.telegram.enabled`
- 如果要开放私聊白名单，当前常见值是 `allowlist` 或 `open`，不是旧写法里的 `allow`
- 如果你只想快速跑起来，最小配置通常就是 `enabled + botToken + dmPolicy`

#### 步骤 3: 配对设备

```bash
# 启动网关
openclaw gateway

# 在 Telegram 给机器人发第一条私聊消息后，查看待批准 pairing
openclaw pairing list telegram

# 按 pairing code 批准，不是按 device id
openclaw pairing approve telegram <CODE>
```

**这里很容易踩坑**：

- Telegram 首次接入走的是 pairing 流程，不是通用设备审批那套
- 审批对象是配对码 `CODE`，不是设备 ID
- pairing code 默认会过期，别拖太久再批

#### 步骤 4: 测试

在 Telegram 中发送 `hi` 给你的机器人，应该收到 AI 回复。

---

### 5.2 WhatsApp 通道

**注意**：WhatsApp 需要扫描 QR 码登录，适合个人使用。

```json
{
  "channels": {
    "whatsapp": {
      "enabled": true,
      "dmPolicy": "pairing"
    }
  }
}
```

启动网关后，会显示 QR 码，用手机 WhatsApp 扫描即可绑定。

---

### 5.3 Discord 通道

适合社区/团队协作场景。

```json5
{
  "channels": {
    "discord": {
      "enabled": true,
      "token": "YOUR_DISCORD_BOT_TOKEN"
    }
  }
}
```

**创建 Discord Bot**: https://discord.com/developers/applications

补充说明：

- 当前最小配置字段是 `channels.discord.token`
- 是否限制到某个服务器、频道、角色，建议在能跑通之后再加 allowlist / guild 配置
- Discord DM 同样默认会走 pairing，不建议教程第一步就把权限模型写复杂

---

## 六、启动网关

### 6.1 前台运行（调试用）

```bash
openclaw gateway
```

**预期输出**:
```
🦞 OpenClaw Gateway 2026.3.2
🔗 Gateway listening on ws://192.168.1.100:18789
📡 Telegram channel connected
🧠 Models: claude-opus-4-5-thinking (primary), qwen-coder (fallback)
✅ Gateway ready
```

### 6.2 后台运行（生产环境）

如果你已经走了 `openclaw onboard --install-daemon`，这一节很多时候可以直接跳过。

当前更推荐的后台安装方式是：

```bash
openclaw gateway install
openclaw gateway start
openclaw gateway status
```

`openclaw daemon ...` 也是等价入口，只是现在更像兼容别名。

**如果你就是想手工写 systemd，也可以**：

创建服务文件 `/etc/systemd/system/openclaw.service`:

```ini
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/home/your-user
ExecStart=/home/your-user/.nvm/versions/node/v24/bin/openclaw gateway
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**启用服务**:
```bash
sudo systemctl daemon-reload
sudo systemctl enable openclaw
sudo systemctl start openclaw

# 查看状态
sudo systemctl status openclaw

# 查看日志
sudo journalctl -u openclaw -f
```

**使用 PM2 (跨平台)**:

```bash
npm install -g pm2

pm2 start $(which openclaw) --name openclaw -- gateway
pm2 save
pm2 startup
```

---

## 七、技能系统使用

OpenClaw 内置 50+ 技能，无需额外安装即可使用。

### 7.1 查看已安装技能

```bash
openclaw skills list
```

**部分内置技能**:
| 技能 | 说明 | 依赖 |
|------|------|------|
| `github` | GitHub 操作（PR/Issue/CI） | `gh` CLI |
| `weather` | 天气查询 | 无 |
| `healthcheck` | 系统安全审计 | 无 |
| `bluebubbles` | BlueBubbles 集成 | BlueBubbles |
| `blogwatcher` | 博客监控 | 无 |
| `camsnap` | 摄像头拍照 | 摄像头 |

### 7.2 使用技能

在 Telegram 中直接对话即可：

```
用户：帮我查一下北京的天气
Agent: 北京今天晴，最高温度 25°C...

用户：查看 openclaw/openclaw 仓库的最近 PR
Agent: 最近 5 个 PR 如下：...
```

### 7.3 安装新技能

从 ClawHub 安装：

```bash
# 搜索技能
openclaw skills search "calendar"

# 安装技能
openclaw skills install <skill-slug>

# 查看技能详情
openclaw skills info <skill-name>

# 查看已安装
openclaw skills list
```

如果你想批量升级：

```bash
openclaw skills update --all
```

**⚠️ 安全提示**：只安装来源可信的技能，安装前查看代码。

---

## 八、定时任务配置

### 8.1 创建定时任务

```bash
# 添加定时任务（每天凌晨 1 点执行）
openclaw cron add \
  --name "daily-report" \
  --cron "0 1 * * *" \
  --session isolated \
  --message "生成今天的日报，包括天气、新闻摘要、待办事项"
```

**Cron 表达式示例**:
| 表达式 | 说明 |
|--------|------|
| `0 1 * * *` | 每天凌晨 1 点 |
| `0 */4 * * *` | 每 4 小时 |
| `0 9 * * 1-5` | 工作日早上 9 点 |
| `0 0 * * 0` | 每周日凌晨 |

### 8.2 查看任务列表

```bash
openclaw cron list
```

**输出示例**:
```
ID                                    Name            Schedule       Status    Next Run
34344ffa-da81-4567-a977-b0445eb82c0e  daily-report    0 1 * * *      active    2026-03-09 01:00
```

### 8.3 编辑/删除任务

```bash
# 编辑任务
openclaw cron edit <id> --message "新的任务描述"

# 删除任务
openclaw cron delete <id>

# 手动触发
openclaw cron run <id>

# 查看运行记录
openclaw cron runs --id <id>
```

### 8.4 心跳任务（轻量级）

对于简单的周期性检查，使用心跳机制更轻量：

编辑 `~/.openclaw/workspace/HEARTBEAT.md`:

```markdown
# 每天检查 2-4 次

- [ ] 检查未读邮件
- [ ] 查看日历（未来 24 小时）
- [ ] 检查服务器状态
- [ ] 天气提醒（如果需要外出）
```

Agent 会在心跳触发时自动执行这些检查。

---

## 九、记忆系统配置

### 9.1 记忆文件结构

```
~/.openclaw/workspace/
├── MEMORY.md              # 长期记忆（手动维护）
├── memory/
│   ├── 2026-03-07.md      # 每日记忆（自动生成）
│   ├── 2026-03-08.md
│   └── ...
└── AGENTS.md              # Agent 行为指南
```

### 9.2 长期记忆 (MEMORY.md)

记录重要决策、项目进展、用户偏好：

```markdown
# MEMORY.md - Long-Term Memory

## Projects & Decisions
- **Bing Rewards Automation**: Abandoned on 2026-02-05. 
  Bing has strong anti-automation detection.
  
- **Blog Tech Stack**: Hexo + NexT theme, deployed to GitHub Pages.

## Technical Notes
- **Browser Relay**: Successfully configured via OpenClaw Browser Relay extension.
- **Firewall**: UFW disabled for RDP (port 3389).

## User Preferences
- **Timezone**: Asia/Shanghai
- **Preferred Models**: Claude Opus > Qwen Coder > Gemini Flash
- **Communication**: Telegram (@veegn)
```

### 9.3 每日记忆 (memory/YYYY-MM-DD.md)

自动生成，记录当天对话和任务：

```markdown
# 2026-03-08 - OpenClaw Deployment Guide

## Tasks Completed
- Created blog post: OpenClaw deployment guide
- Configured Telegram channel
- Set up daily cron job for blog sync

## Issues Encountered
- Network timeout during git push (resolved with retry)
```

---

## 十、安全加固

### 10.1 运行安全审计

```bash
# 快速审计
openclaw security audit

# 深度审计
openclaw security audit --deep

# 自动修复（安全范围内）
openclaw security audit --fix
```

### 10.2 网关安全配置

编辑 `~/.openclaw/openclaw.json`:

```json
{
  "gateway": {
    "port": 18789,
    "bind": "127.0.0.1",  // 仅本地访问
    "auth": {
      "mode": "token",
      "token": "生成一个强随机 token"
    },
    "tailscale": {
      "mode": "on"  // 使用 Tailscale 进行远程访问
    }
  }
}
```

**安全建议**:
1. ✅ **不要暴露网关到公网**（使用 SSH 隧道或 Tailscale）
2. ✅ **使用强 token**（至少 32 位随机字符）
3. ✅ **定期更新**（`openclaw update`）
4. ✅ **定期运行** `openclaw security audit --deep`

### 10.3 SSH 隧道远程访问

```bash
# 本地 SSH 隧道
ssh -N -L 18789:127.0.0.1:18789 user@your-server

# 然后本地客户端可以连接
wscat -c ws://127.0.0.1:18789
```

---

## 十一、常见问题排查

### 11.1 模型认证失败

**错误**: `OAuth token refresh failed`

**解决**:
```bash
# 重新认证（按你实际使用的 provider 来）
openclaw models auth login --provider google-gemini-cli --set-default

# 或者重新走 API key onboarding
openclaw onboard --auth-choice gemini-api-key

# 清除旧凭证
rm -rf ~/.openclaw/credentials/google-*

# 重新登录
```

### 11.2 Telegram 机器人无响应

**检查清单**:
1. ✅ Bot Token 是否正确
2. ✅ Telegram 通道是否已配置并启动（`openclaw channels list` / `openclaw channels status --probe`）
3. ✅ 网关日志是否有错误（`openclaw logs --follow`）
4. ✅ 是否完成 Telegram pairing 审批

**查看日志**:
```bash
openclaw logs --grep "telegram" --follow
```

### 11.3 定时任务未执行

**检查**:
```bash
# 查看任务状态
openclaw cron list

# 查看任务日志
openclaw cron runs --id <job-id>

# 手动触发测试
openclaw cron run <job-id>
```

**常见问题**:
- 网关未运行（`systemctl status openclaw`）
- Cron 表达式错误（使用 [crontab.guru](https://crontab.guru) 验证）
- 模型全部失败（检查认证状态）

### 11.4 内存占用过高

**诊断**:
```bash
# 查看会话状态
openclaw sessions --verbose

# 先做 dry-run，看会清理什么
openclaw sessions cleanup --dry-run

# 按当前 session.maintenance 配置真正执行
openclaw sessions cleanup --enforce

# 查看提供商用量/配额
openclaw status --usage
```

**优化建议**:
- 启用会话压缩（默认已启用）
- 定期清理旧会话
- 减少并发会话数（`agents.defaults.maxConcurrent`）

---

## 十二、最佳实践

### 12.1 配置文件管理

**使用 Git 版本控制**:
```bash
cd ~/.openclaw/workspace
git init
git add .
git commit -m "Initial OpenClaw config"

# 注意：不要提交 credentials/ 和 openclaw.json（含敏感信息）
```

**.gitignore 示例**:
```gitignore
# 敏感信息
credentials/
openclaw.json

# 日志
logs/

# 临时文件
*.tmp
```

### 12.2 备份策略

```bash
# 每周备份配置
0 2 * * 0 tar -czf ~/backups/openclaw-$(date +\%Y\%m\%d).tar.gz ~/.openclaw/workspace
```

### 12.3 监控告警

**健康检查（推荐走 CLI）**:
```bash
openclaw health
openclaw health --json
```

**预期响应**:
```json
{
  "status": "ok",
  "gateway": "running"
}
```

**集成监控**（Prometheus/Grafana）:
- 监控网关端口连通性
- 监控消息队列深度
- 监控模型错误率

---

## 十三、进阶配置

### 13.1 多模型路由策略

更实用的做法通常不是“硬写 useFor”，而是先把默认模型和 allowlist 配好，再根据需要用 `/model` 或多 agent 拆分。

例如：

```json5
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "google/gemini-3.1-pro-preview",
        "fallbacks": [
          "qwen/qwen3-coder-plus"
        ]
      },
      "models": {
        "google/gemini-3.1-pro-preview": { "alias": "pro" },
        "qwen/qwen3-coder-plus": { "alias": "coder" },
        "google/gemini-3-flash-preview": { "alias": "flash" }
      }
    }
  }
}
```

这样做的好处是：

- `agents.defaults.models` 同时也是 `/model` 的 allowlist
- 读者可以直接在聊天里用 `/model list` 和 `/model <alias>` 切换
- 比“按任务类型自动映射”更贴近当前官方文档和日常使用习惯

### 13.2 自定义 Agent 人格

编辑 `~/.openclaw/workspace/SOUL.md`:

```markdown
# SOUL.md - Who You Are

## Core Traits
- Be concise and direct
- Use humor when appropriate
- Admit when you're uncertain
- Prioritize security over convenience

## Communication Style
- Technical but accessible
- Use emojis sparingly
- Provide code examples when helpful

## Boundaries
- Never execute destructive commands without confirmation
- Don't share sensitive information
- Respect user's time and attention
```

### 13.3 自定义工具开发

创建工具文件 `~/.openclaw/workspace/tools/my-tool.js`:

```javascript
// my-tool.js
export async function queryDatabase(query) {
  const { exec } = await import('child_process');
  
  return new Promise((resolve, reject) => {
    exec(`psql -c "${query}"`, (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}

export const schema = {
  type: 'object',
  properties: {
    query: { type: 'string', description: 'SQL query to execute' }
  },
  required: ['query']
};
```

---

## 十四、资源与社区

### 官方资源
- **GitHub**: https://github.com/openclaw/openclaw
- **文档**: https://docs.openclaw.ai
- **技能市场**: https://clawhub.com
- **Discord**: https://discord.com/invite/clawd

### 学习路径
1. ✅ **入门**: 完成本教程配置
2. 📚 **进阶**: 阅读官方文档中的 Gateway / Channels / Skills / Cron 部分
3. 🛠️ **实践**: 安装并使用现有 Skills
4. 💻 **开发**: 创建自定义 Skill 或插件
5. 🤝 **贡献**: 提交 PR 到官方仓库

### 社区项目
- **awesome-openclaw-skills**: https://github.com/VoltAgent/awesome-openclaw-skills
- **OpenClaw 中文社区**: （待添加）

---

## 结语

恭喜你完成 OpenClaw 从零到一的部署！现在你拥有了一个：

- ✅ 24 小时在线的个人 AI 助手
- ✅ 支持多模型故障转移的可靠系统
- ✅ 可扩展的技能生态系统
- ✅ 自动化定时任务执行能力

**下一步建议**:
1. 探索内置技能（`openclaw skills list`）
2. 配置定时任务（日报、监控、备份）
3. 尝试自定义技能开发
4. 加入社区分享你的配置

**遇到问题？**
- 查看日志：`openclaw logs --follow`
- 运行诊断：`openclaw doctor`
- 社区求助：Discord 或 GitHub Issues

---

**延伸阅读**:
- [Gateway Protocol 详解](/gateway/protocol)
- [Skills 开发指南](/tools/skills)
- [安全加固最佳实践](/security)

**有问题？** 欢迎在评论区留言或加入 Discord 社区讨论！
