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
description: 从零开始配置部署 OpenClaw AI Agent，涵盖环境准备、模型认证、通道配置、技能安装、定时任务设置等完整流程，包含常见问题排查和最佳实践。
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

**Node.js 版本要求**：Node.js 24+ 

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

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "google-antigravity/claude-opus-4-5-thinking",
        "fallbacks": [
          "qwen-portal/coder-model",
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

---

## 四、模型认证配置

OpenClaw 支持多种 LLM 提供商，推荐至少配置 2 个以实现故障转移。

### 4.1 Google Antigravity (Claude/Gemini)

**认证方式**: OAuth（推荐）或 API Key

```bash
# OAuth 登录（浏览器弹出授权）
openclaw models auth login --provider google-antigravity

# 或使用 API Key
openclaw models auth login --provider google --api-key
# 按提示输入密钥（不会显示在屏幕上）
```

**验证状态**:
```bash
openclaw models list
```

**预期输出**:
```
Model                                      Input      Ctx      Local Auth  Tags
google-antigravity/claude-opus-4-5-thin... text+image 195k     no    yes   default
google-antigravity/gemini-3-flash          text+image 1024k    no    yes   configured
```

### 4.2 Qwen Portal (通义千问)

```bash
# OAuth 登录
openclaw models auth login --provider qwen-portal
```

**免费额度**：Qwen Portal 目前提供免费额度，适合开发测试。

### 4.3 配置故障转移

编辑 `~/.openclaw/openclaw.json`：

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "google-antigravity/claude-opus-4-5-thinking",
        "fallbacks": [
          "qwen-portal/coder-model",
          "qwen-portal/vision-model",
          "google/gemini-3-flash-preview"
        ]
      }
    }
  }
}
```

**故障转移逻辑**：
1. 优先使用主模型（Claude Opus）
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

```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
      "dmPolicy": "pairing",
      "groupPolicy": "allowlist"
    }
  },
  "plugins": {
    "entries": {
      "telegram": {
        "enabled": true
      }
    }
  }
}
```

**配置说明**:
| 参数 | 说明 | 推荐值 |
|------|------|--------|
| `botToken` | 机器人 Token | 从 BotFather 获取 |
| `dmPolicy` | 私聊策略 | `pairing`（需配对）/`allow`（允许所有） |
| `groupPolicy` | 群聊策略 | `allowlist`（白名单）/`block`（禁止） |

#### 步骤 3: 配对设备

```bash
# 启动网关
openclaw gateway

# 在另一个终端查看配对请求
openclaw devices list

# 批准配对（或直接在 Telegram 发送 /start 给机器人）
openclaw devices approve <device-id>
```

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

```json
{
  "channels": {
    "discord": {
      "enabled": true,
      "botToken": "YOUR_DISCORD_BOT_TOKEN",
      "guildId": "YOUR_SERVER_ID"
    }
  }
}
```

**创建 Discord Bot**: https://discord.com/developers/applications

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

**使用 systemd (Linux)**:

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
# 浏览可用技能
openclaw clawhub list

# 安装技能
openclaw clawhub install <skill-name>

# 查看已安装
openclaw skills list
```

**⚠️ 安全提示**：只安装来源可信的技能，安装前查看代码。

---

## 八、定时任务配置

### 8.1 创建定时任务

```bash
# 添加定时任务（每天凌晨 1 点执行）
openclaw cron add \
  --name "daily-report" \
  --schedule "0 1 * * *" \
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
4. ✅ **审计已安装技能**（`openclaw skills audit`）

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
# 重新认证
openclaw models auth login --provider google-antigravity

# 清除旧凭证
rm -rf ~/.openclaw/credentials/google-*

# 重新登录
```

### 11.2 Telegram 机器人无响应

**检查清单**:
1. ✅ Bot Token 是否正确
2. ✅ 插件是否启用（`openclaw channels list`）
3. ✅ 网关日志是否有错误（`openclaw logs --follow`）
4. ✅ 是否完成设备配对

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
openclaw cron runs <job-id>

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
openclaw sessions list --verbose

# 清理旧会话
openclaw sessions cleanup --older-than 7d

# 查看模型使用
openclaw model-usage
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

**健康检查端点**:
```bash
curl http://127.0.0.1:18789/__openclaw__/health
```

**预期响应**:
```json
{
  "status": "ok",
  "gateway": "running",
  "channels": ["telegram"],
  "models": ["claude-opus-4-5-thinking"]
}
```

**集成监控**（Prometheus/Grafana）:
- 监控网关端口连通性
- 监控消息队列深度
- 监控模型错误率

---

## 十三、进阶配置

### 13.1 多模型路由策略

根据任务类型自动选择模型：

```json
{
  "agents": {
    "defaults": {
      "models": {
        "google-antigravity/claude-opus-4-5-thinking": {
          "useFor": ["reasoning", "coding", "analysis"]
        },
        "qwen-portal/coder-model": {
          "useFor": ["quick-tasks", "simple-queries"]
        },
        "qwen-portal/vision-model": {
          "useFor": ["image-analysis"]
        }
      }
    }
  }
}
```

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
2. 📚 **进阶**: 阅读 [官方文档](/concepts/architecture)
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
- [OpenClaw 架构解析与二次开发指南](/posts/openclaw-architecture-dev/)
- [Gateway Protocol 详解](/gateway/protocol)
- [Skills 开发指南](/tools/skills)
- [安全加固最佳实践](/security)

**有问题？** 欢迎在评论区留言或加入 Discord 社区讨论！
