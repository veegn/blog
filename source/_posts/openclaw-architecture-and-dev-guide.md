---
title: OpenClaw 架构解析与二次开发指南
date: 2026-03-07
tags:
  - OpenClaw
  - AI Agent
  - 架构设计
  - 开发指南
categories:
  - 技术教程
abbrlink: openclaw-architecture-dev
description: 深入解析 OpenClaw 的模块化架构，包括 Gateway、Channels、Skills、Extensions 等核心组件，并提供完整的二次开发指南和实战示例。
---

# OpenClaw 架构解析与二次开发指南

> 📦 **版本信息**：本文基于 OpenClaw v2026.3.2 编写  
> 🔗 **官方仓库**：https://github.com/openclaw/openclaw  
> 📚 **官方文档**：https://docs.openclaw.ai

---

## 一、OpenClaw 是什么？

OpenClaw 是一个**多通道 AI 代理网关系统**，核心目标是让 AI Agent 能够通过多种消息平台（Telegram、WhatsApp、Discord、Slack 等）与用户交互，同时提供可扩展的技能系统和节点设备管理能力。

### 核心特性

| 特性 | 说明 |
|------|------|
| **多通道支持** | Telegram、WhatsApp、Discord、Slack、Signal、iMessage 等 |
| **WebSocket 网关** | 统一的长连接协议，支持实时事件推送 |
| **Skills 系统** | 可扩展的功能模块（GitHub 操作、天气查询、笔记管理等） |
| **节点管理** | 支持 macOS/iOS/Android/Headless 设备配对与远程控制 |
| **会话管理** | 持久化记忆、上下文压缩、多会话隔离 |
| **模型故障转移** | 多 LLM 提供商自动切换，保证服务可用性 |

---

## 二、项目结构解析

```
openclaw/
├── openclaw.mjs          # CLI 入口点
├── package.json          # 项目配置与依赖
├── dist/                 # 编译后的 JavaScript 代码
│   ├── gateway/          # 网关核心逻辑
│   ├── agents/           # Agent 运行循环
│   ├── channels/         # 消息通道实现
│   ├── tools/            # 工具系统
│   └── plugin-sdk/       # 插件开发 SDK
├── extensions/           # 官方扩展插件（54+ 个）
│   ├── telegram/         # Telegram 通道
│   ├── discord/          # Discord 通道
│   ├── google-antigravity-auth/  # Google OAuth 认证
│   └── memory-core/      # 核心记忆系统
├── skills/               # 官方技能库（54+ 个）
│   ├── github/           # GitHub 操作技能
│   ├── weather/          # 天气查询技能
│   ├── healthcheck/      # 系统安全审计技能
│   └── bluebubbles/      # BlueBubbles 集成技能
├── docs/                 # 官方文档（支持多语言）
│   ├── concepts/         # 核心概念
│   ├── gateway/          # 网关协议与安全
│   ├── channels/         # 通道配置
│   ├── plugins/          # 插件开发指南
│   └── zh-CN/            # 中文文档
└── assets/               # 静态资源
```

---

## 三、核心模块详解

### 3.1 Gateway（网关）

**位置**: `dist/gateway/`

网关是 OpenClaw 的**核心中枢**，负责：

- 维护所有消息通道的连接（WhatsApp、Telegram 等）
- 提供 WebSocket API 供客户端（CLI、macOS App、Web UI）连接
- 管理节点设备配对与命令分发
- 处理 Agent 请求并流式返回结果

**关键文件**:
- `dist/gateway/server-*.js` - WebSocket 服务器实现
- `dist/gateway/protocol/` - 协议定义与验证

**协议特点**:
```json
// 连接握手
{
  "type": "req",
  "method": "connect",
  "params": {
    "auth": { "token": "xxx" },
    "role": "client" // 或 "node"
  }
}

// 事件推送
{
  "type": "event",
  "event": "agent",
  "payload": { "runId": "xxx", "status": "streaming" }
}
```

---

### 3.2 Channels（消息通道）

**位置**: `extensions/<channel-name>/`

每个通道是一个独立的插件，负责：

- 与第三方消息平台 API 交互
- 消息格式转换（平台格式 ↔ OpenClaw 统一格式）
- 处理平台特定功能（回复、反应、文件上传等）

**示例：Telegram 通道**
```
extensions/telegram/
├── openclaw.plugin.json  # 插件清单
├── package.json          # 依赖配置
├── index.ts              # 入口文件
└── src/
    ├── telegram-client.ts    # Telegram API 客户端
    ├── message-handler.ts    # 消息处理逻辑
    └── config-schema.ts      # 配置验证
```

**支持的通道**:
| 通道 | 状态 | 说明 |
|------|------|------|
| Telegram | ✅ | 基于 grammY |
| WhatsApp | ✅ | 基于 Baileys |
| Discord | ✅ | 官方 API |
| Slack | ✅ | Bolt.js |
| Signal | ✅ | signald 桥接 |
| iMessage | ✅ | macOS 专用 |
| IRC | ✅ | 传统协议 |
| Matrix | ✅ | 去中心化协议 |

---

### 3.3 Skills（技能系统）

**位置**: `skills/<skill-name>/`

Skills 是 OpenClaw 的**功能扩展单元**，每个 Skill 提供特定领域的能力：

**示例：GitHub Skill**
```markdown
skills/github/
├── SKILL.md              # 技能说明文档（含使用指南）
├── package.json          # 依赖配置
└── src/
    ├── github-commands.ts    # gh CLI 封装
    └── issue-templates.ts    # Issue 模板
```

**SKILL.md 结构**:
```markdown
---
name: github
description: GitHub operations via `gh` CLI
metadata:
  openclaw:
    emoji: "🐙"
    requires: { bins: ["gh"] }
    install:
      - kind: brew
        formula: gh
---

# GitHub Skill

## When to Use
✅ 检查 PR 状态、CI 运行情况
✅ 创建/评论 Issue
✅ 查询 GitHub API

## Common Commands
gh pr list --repo owner/repo
gh run view <run-id> --log-failed
```

**内置 Skills 分类**:
| 分类 | 示例 |
|------|------|
| 开发工具 | github, gh-issues, coding-agent |
| 生活服务 | weather, gemini, goplaces |
| 笔记管理 | notion, obsidian, bear-notes |
| 系统工具 | healthcheck, model-usage, camsnap |
| 媒体处理 | gifgrep, nano-pdf, openai-image-gen |

---

### 3.4 Extensions（扩展插件）

**位置**: `extensions/<plugin-name>/`

Extensions 是比 Skills 更底层的扩展机制，可以：

- 添加新的消息通道
- 提供认证提供商（OAuth、API Key）
- 扩展记忆系统
- 添加自定义工具

**插件清单示例** (`openclaw.plugin.json`):
```json
{
  "id": "telegram",
  "channels": ["telegram"],
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "botToken": { "type": "string" },
      "dmPolicy": { "type": "string", "enum": ["pairing", "allow", "block"] }
    }
  }
}
```

**官方插件分类**:
| 类型 | 插件示例 |
|------|---------|
| 通道插件 | telegram, discord, slack, matrix |
| 认证插件 | google-antigravity-auth, qwen-portal-auth |
| 记忆插件 | memory-core, memory-lancedb |
| 工具插件 | llm-task, diagnostics-otel |

---

### 3.5 Agents（Agent 系统）

**位置**: `dist/agents/`

Agent 是 OpenClaw 的**智能核心**，负责：

- 管理会话上下文和记忆
- 调用工具和技能
- 与 LLM 提供商交互
- 处理流式响应

**关键概念**:
- **Session**: 独立的对话上下文，包含消息历史和工具状态
- **Memory**: 长期记忆存储（MEMORY.md + memory/*.md）
- **Compaction**: 上下文压缩，防止 token 超限
- **Tool Calling**: 结构化函数调用，支持多工具并行

---

### 3.6 Models（模型提供商）

**位置**: `dist/providers/`

支持多种 LLM 提供商，具备自动故障转移能力：

| 提供商 | 模型示例 | 认证方式 |
|--------|---------|---------|
| google-antigravity | claude-opus-4-5-thinking, gemini-3-flash | OAuth |
| qwen-portal | coder-model, vision-model | OAuth |
| google | gemini-3-flash-preview | API Key |
| minimax-portal | various | OAuth |

**故障转移配置**:
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

---

## 四、二次开发指南

### 4.1 开发环境准备

```bash
# 1. 克隆仓库
git clone https://github.com/openclaw/openclaw.git
cd openclaw

# 2. 安装依赖（需要 pnpm）
pnpm install

# 3. 开发模式运行
pnpm dev

# 4. 构建生产版本
pnpm build
```

**前置要求**:
- Node.js 24+ 
- pnpm 9+
- Git
- （可选）Docker - 用于测试通道插件

---

### 4.2 开发新通道插件

**场景**: 添加微信（WeChat）支持

**步骤 1: 创建插件目录**
```bash
extensions/wechat/
├── openclaw.plugin.json
├── package.json
├── index.ts
└── src/
    ├── wechat-client.ts
    └── message-handler.ts
```

**步骤 2: 定义插件清单**
```json
{
  "id": "wechat",
  "channels": ["wechat"],
  "name": "WeChat Channel",
  "description": "WeChat messaging integration",
  "configSchema": {
    "type": "object",
    "properties": {
      "appId": { "type": "string" },
      "appSecret": { "type": "string" },
      "token": { "type": "string" }
    },
    "required": ["appId", "appSecret", "token"]
  }
}
```

**步骤 3: 实现通道接口**
```typescript
// index.ts
import type { ChannelPlugin } from '@openclaw/plugin-sdk';

export const plugin: ChannelPlugin = {
  id: 'wechat',
  channels: ['wechat'],
  
  async init(config) {
    const client = new WeChatClient(config.appId, config.appSecret);
    await client.connect();
    
    client.on('message', async (msg) => {
      // 转换消息格式并发送给 Gateway
      await this.sendToGateway({
        channel: 'wechat',
        from: msg.fromId,
        text: msg.content,
        timestamp: msg.timestamp
      });
    });
  },
  
  async send(message) {
    // 发送消息到微信
    await wechatClient.sendMessage(message.to, message.text);
  }
};
```

**步骤 4: 测试与调试**
```bash
# 在 openclaw.json 中启用插件
{
  "plugins": {
    "entries": {
      "wechat": {
        "enabled": true,
        "appId": "your-app-id",
        "appSecret": "your-secret",
        "token": "your-token"
      }
    }
  }
}

# 重启网关
openclaw gateway restart
```

---

### 4.3 开发新 Skills

**场景**: 创建 Bilibili 视频搜索技能

**步骤 1: 创建技能目录**
```bash
skills/bilibili/
├── SKILL.md
├── package.json
└── src/
    └── bilibili-search.ts
```

**步骤 2: 编写 SKILL.md**
```markdown
---
name: bilibili
description: Search Bilibili videos and get video info
metadata:
  openclaw:
    emoji: "📺"
    requires: { bins: ["curl", "jq"] }
---

# Bilibili Skill

## When to Use
✅ 搜索 B 站视频
✅ 获取视频详细信息
✅ 查询 UP 主信息

## Commands
curl 'https://api.bilibili.com/x/web-interface/search/type?keyword=xxx'
```

**步骤 3: 实现技能逻辑**
```typescript
// src/bilibili-search.ts
import { exec } from 'child_process';

export async function searchVideo(keyword: string) {
  const url = `https://api.bilibili.com/x/web-interface/search/type?keyword=${encodeURIComponent(keyword)}`;
  
  return new Promise((resolve, reject) => {
    exec(`curl -s "${url}" | jq '.data.result'`, (error, stdout) => {
      if (error) reject(error);
      else resolve(JSON.parse(stdout));
    });
  });
}

export async function getVideoInfo(bvid: string) {
  const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
  // 类似实现...
}
```

**步骤 4: 在 Agent 中使用**
```typescript
// 技能会自动被 Agent 发现并可用
// 用户可以直接问："帮我找一下 Rust 编程教程视频"
// Agent 会自动调用 bilibili-search 技能
```

---

### 4.4 开发自定义工具 (Tools)

**场景**: 添加数据库查询工具

**位置**: `extensions/my-tools/src/tools/database-tool.ts`

```typescript
import { z } from 'zod';
import type { Tool } from '@openclaw/plugin-sdk';

export const databaseTool: Tool = {
  name: 'query_database',
  description: 'Execute SQL queries against the configured database',
  
  inputSchema: z.object({
    query: z.string().describe('SQL query to execute'),
    readOnly: z.boolean().default(true).describe('Prevent WRITE operations')
  }),
  
  async execute(params) {
    const { query, readOnly } = params;
    
    if (readOnly && /INSERT|UPDATE|DELETE|DROP/i.test(query)) {
      throw new Error('WRITE operations not allowed in read-only mode');
    }
    
    const result = await db.execute(query);
    return {
      success: true,
      rows: result.rows,
      rowCount: result.rowCount
    };
  }
};
```

**注册工具**:
```json
{
  "id": "my-tools",
  "tools": ["database-tool"],
  "configSchema": {
    "type": "object",
    "properties": {
      "databaseUrl": { "type": "string" }
    }
  }
}
```

---

### 4.5 扩展记忆系统

**场景**: 使用 PostgreSQL 存储长期记忆

**步骤 1: 创建记忆插件**
```bash
extensions/memory-postgres/
├── openclaw.plugin.json
└── src/
    └── postgres-memory.ts
```

**步骤 2: 实现记忆接口**
```typescript
import type { MemoryProvider } from '@openclaw/plugin-sdk';

export const postgresMemory: MemoryProvider = {
  id: 'memory-postgres',
  kind: 'memory',
  
  async init(config) {
    this.db = await connect(config.databaseUrl);
  },
  
  async get(sessionKey: string) {
    const result = await this.db.query(
      'SELECT content FROM memories WHERE session_key = $1',
      [sessionKey]
    );
    return result.rows.map(r => r.content);
  },
  
  async set(sessionKey: string, content: string) {
    await this.db.query(
      'INSERT INTO memories (session_key, content, created_at) VALUES ($1, $2, NOW())',
      [sessionKey, content]
    );
  },
  
  async search(query: string, limit: number = 10) {
    const result = await this.db.query(
      `SELECT content FROM memories 
       WHERE content ILIKE $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [`%${query}%`, limit]
    );
    return result.rows.map(r => r.content);
  }
};
```

---

### 4.6 修改核心行为

**场景**: 自定义会话压缩策略

**位置**: `dist/agents/session-pruning-*.js`

**注意**: 直接修改 `dist/` 不推荐，应该：

1. **Fork 仓库** 并在源码修改
2. **使用补丁** (`patch-package`)
3. **提交 PR** 到官方仓库

**示例修改点**:
```typescript
// 在源码中修改压缩触发条件
// src/agents/session-pruning.ts

// 原逻辑：上下文达到 80% 时压缩
if (contextUsage > 0.8) {
  await compact();
}

// 修改为：根据消息数量 + token 数双重判断
if (contextUsage > 0.7 || messageCount > 100) {
  await compact({
    strategy: 'aggressive', // 更激进的压缩
    keepLastN: 20           // 保留最近 20 条消息
  });
}
```

---

## 五、实战项目推荐

### 5.1 个人自动化助手

**目标**: 整合个人服务，通过 Telegram 控制

**实现**:
```typescript
// 技能组合
- telegram (通道)
- home-assistant (技能 - 控制智能家居)
- calendar (技能 - 日程管理)
- weather (技能 - 天气提醒)
- healthcheck (技能 - 系统监控)

// 配置示例
{
  "agents": {
    "defaults": {
      "workspace": "/home/user/automation",
      "model": {
        "primary": "google-antigravity/claude-opus-4-5-thinking"
      }
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "YOUR_BOT_TOKEN"
    }
  }
}
```

**使用场景**:
- "明天天气怎么样？"
- "打开客厅的灯"
- "我下午有什么会议？"
- "检查服务器状态"

---

### 5.2 团队协作机器人

**目标**: 在 Discord/Slack 中提供 AI 辅助

**实现**:
```typescript
// 技能组合
- discord/slack (通道)
- github (技能 - PR/Issue 管理)
- notion (技能 - 文档查询)
- custom-tools (自定义工具 - 内部 API)

// 多会话配置
{
  "agents": {
    "maxConcurrent": 10,  // 支持 10 个并发会话
    "subagents": {
      "maxConcurrent": 20  // 支持 20 个子代理
    }
  }
}
```

**使用场景**:
- 代码审查辅助
- 文档快速检索
- 会议纪要生成
- 任务自动分配

---

### 5.3 多模态内容创作

**目标**: 结合图像、语音、文本创作内容

**实现**:
```typescript
// 技能组合
- openai-image-gen (图像生成)
- openai-whisper (语音转文字)
- tts (文字转语音)
- canvas (可视化展示)

// 配置示例
{
  "tools": {
    "profile": "full"  // 启用所有工具
  },
  "tts": {
    "enabled": true,
    "provider": "elevenlabs"
  }
}
```

**使用场景**:
- 播客脚本生成 + 语音合成
- 文章配图自动生成
- 视频字幕自动翻译

---

## 六、调试与测试

### 6.1 开发模式调试

```bash
# 启用详细日志
OPENCLAW_LOG_LEVEL=debug openclaw gateway

# 跳过通道初始化（快速启动）
OPENCLAW_SKIP_CHANNELS=1 openclaw gateway

# WebSocket 调试
wscat -c ws://127.0.0.1:18789 -H "Authorization: Bearer YOUR_TOKEN"
```

### 6.2 测试技能

```bash
# 列出已安装技能
openclaw skills list

# 测试技能命令
openclaw skills run github --command "pr list --repo openclaw/openclaw"

# 查看技能日志
openclaw logs --grep "skill:github"
```

### 6.3 性能分析

```bash
# 查看模型使用情况
openclaw model-usage

# 会话内存分析
openclaw sessions list --verbose

# 网关性能指标
curl http://127.0.0.1:18789/__openclaw__/health
```

---

## 七、最佳实践

### 7.1 代码组织

```
my-openclaw-extensions/
├── channels/           # 自定义通道
│   └── wechat/
├── skills/             # 自定义技能
│   ├── bilibili/
│   └── internal-api/
├── tools/              # 自定义工具
│   └── database/
└── plugins/            # 完整插件
    └── memory-redis/
```

### 7.2 错误处理

```typescript
// 始终捕获并记录错误
try {
  await skill.execute(params);
} catch (error) {
  logger.error(`Skill ${skill.name} failed:`, error);
  
  // 向用户返回友好错误
  return {
    success: false,
    error: `技能执行失败：${error.message}`
  };
}
```

### 7.3 安全考虑

- **不要硬编码密钥**：使用 `openclaw secrets` 管理
- **验证用户输入**：所有外部输入都需要验证
- **最小权限原则**：技能只请求必要的权限
- **审计日志**：记录所有敏感操作

---

## 八、资源与社区

### 官方资源
- **GitHub**: https://github.com/openclaw/openclaw
- **文档**: https://docs.openclaw.ai
- **技能市场**: https://clawhub.com
- **Discord 社区**: https://discord.com/invite/clawd

### 学习路径
1. **入门**: 阅读 [Getting Started](/start)
2. **概念**: 理解 [Architecture](/concepts/architecture)
3. **实践**: 安装并使用现有 Skills
4. **开发**: 创建第一个自定义 Skill
5. **贡献**: 提交 PR 到官方仓库

---

## 结语

OpenClaw 提供了一个**高度模块化**的 AI 代理框架，通过清晰的架构设计和丰富的扩展点，开发者可以：

- ✅ 快速集成新的消息平台
- ✅ 创建领域特定的 AI 技能
- ✅ 定制 Agent 行为和记忆系统
- ✅ 构建复杂的多模态应用

无论是个人自动化助手，还是企业级协作工具，OpenClaw 都提供了坚实的基础。希望本指南能帮助你开始二次开发之旅！

---

**延伸阅读**:
- [Gateway Protocol](/gateway/protocol) - WebSocket 协议详解
- [Plugin System](/tools/plugin) - 插件开发完整指南
- [Skills Reference](/tools/skills) - 技能 API 参考
- [Security Best Practices](/security) - 安全加固指南

**有问题？** 欢迎在 GitHub Issues 或 Discord 社区提问！
