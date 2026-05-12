---
title: CLIProxyAPI 部署与应用指南：为 CLI 工具提供强大的大模型代理支持
date: 2026-05-11 10:00:00
description: 详细介绍 CLIProxyAPI 的功能特性、部署方法以及在实际开发中的应用场景，帮助你更好地管理和调度多账号的 AI 模型额度。
tags:
  - CLIProxyAPI
  - API 代理
  - OpenAI
  - Claude Code
  - Gemini
categories:
  - 技术教程
abbrlink: cliproxyapi-deployment-guide
ai_generated: true
---

# CLIProxyAPI 部署与应用指南：为 CLI 工具打造专属大模型代理

> 项目仓库：[router-for-me/CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)  
> 关键词：CLIProxyAPI、API 代理、多账号管理、OAuth 接入、Claude Code、OpenAI Codex

随着 AI 编程助手的普及，开发者们往往需要同时使用多种工具和多个 AI 平台账号。但如何在不同的 CLI 工具之间优雅地共享这些账号额度，同时避免繁琐的 API Key 管理？

**CLIProxyAPI** 正是为了解决这个问题而生。它是一个为 CLI 提供 OpenAI / Gemini / Claude / Codex 兼容 API 接口的代理服务器，让你可以轻松实现本地或多账户的 AI 模型统一调度。

这篇文章将带你完整了解 CLIProxyAPI 的核心功能、部署方式以及它在实际开发生态中的应用案例。

<!-- more -->

---

## 一、为什么需要 CLIProxyAPI？

在实际的开发工作流中，我们常常会遇到以下痛点：

1. **多账号管理困难**：你有多个 ChatGPT、Claude 或 Gemini 账号，额度分散，无法有效合并利用。
2. **API Key 泄露风险**：在各种脚本和 CLI 工具中硬编码 API Key 存在安全隐患。
3. **OAuth 接入门槛高**：官方的 Claude Code 和 OpenAI Codex 支持基于 OAuth 的登录，但第三方工具很难直接利用这些通过 OAuth 获取的额度。
4. **模型切换繁琐**：不同的工具可能只支持特定的模型 API 格式（如只支持 OpenAI 格式），导致你无法自由切换后端的实际模型提供商。

CLIProxyAPI 提供了一个优雅的中间层解决方案，把所有这些复杂性都在代理侧屏蔽掉。

---

## 二、CLIProxyAPI 的核心功能特性

CLIProxyAPI 并不是简单的请求转发，它内置了大量针对 AI 开发工作流优化的功能：

- **多协议兼容**：提供完全兼容 OpenAI、Gemini、Claude 和 Codex 的 API 端点。
- **OAuth 账号无缝接入**：支持通过 OAuth 登录接入 OpenAI Codex（GPT 系列）和 Claude Code，**无需 API 密钥**即可使用订阅额度。
- **多账户负载均衡**：支持多账号配置与轮询（Round-robin）负载均衡，最大化利用你的所有可用额度。
- **高级特性支持**：
  - 支持流式（Streaming）、非流式及 WebSocket 响应。
  - 完美支持 Function Calling / Tools 调用。
  - 支持多模态输入（文本和图片）。
- **生态集成**：内置对 Amp CLI 和多种 IDE 扩展的路由支持，具备智能模型回退功能（例如 `claude-opus-4.5` 自动回退到 `claude-sonnet-4`）。

---

## 三、部署与管理配置

由于国内网络环境对 Google 等服务的限制，**强烈建议将 CLIProxyAPI 部署在海外的 VPS 上**，并通过 Docker 的方式进行管理，以保证服务的连通性和稳定性。

### 3.1 基于 Docker Compose 的 VPS 部署

使用 Docker Compose 是在服务器上部署 CLIProxyAPI 最优雅的方式。

1. **登录你的海外 VPS**，新建一个目录：
   ```bash
   mkdir -p ~/cliproxyapi && cd ~/cliproxyapi
   ```

2. **创建 `docker-compose.yml` 文件**：
   ```yaml
   services:
     cli-proxy-api:
       image: eceasy/cli-proxy-api:latest
       container_name: cli-proxy-api
       pull_policy: always
       ports:
         - "8317:8317"    # 默认 API 代理端口
         - "8085:8085"    # 可选的管理端口
       volumes:
         - ./config.yaml:/CLIProxyAPI/config.yaml
         - ./auths:/root/.cli-proxy-api
         - ./logs:/CLIProxyAPI/logs
       restart: unless-stopped
   ```
   *注意：如果你暂时没有 `config.yaml`，可以创建一个空文件或者使用项目提供的模板文件，以避免 Docker 将其识别为目录。*

3. **启动服务**：
   ```bash
   docker compose up -d
   ```
   你可以通过 `docker logs -f cli-proxy-api` 查看启动日志，确认服务是否成功绑定到了 `8317` 端口。

### 3.2 部署注意事项与安全性配置

将代理暴露在公网的 VPS 上会带来极大的便利，但同时也伴随着较高的安全风险，特别是涉及到敏感的 OAuth Token 时。以下是你**必须注意的点**：

- **公网访问控制**：默认情况下，上述 `docker-compose.yml` 会将 `8317` 端口暴露到所有网卡（`0.0.0.0`）。如果你的 VPS 没有配置安全组，任何人都可能扫到这个端口并消耗你的额度。
  - **建议 1**：修改 `ports` 映射为 `- "127.0.0.1:8317:8317"`，然后使用 Nginx 或 Caddy 进行反向代理，并在 Web 服务器层面添加 `Basic Auth` 鉴权或者限制特定 IP 访问。
  - **建议 2**：在云服务商（如 AWS、阿里云海外等）的安全组或防火墙中，严格限制 `8317` 和管理端口仅允许你本地的网络 IP 访问。
- **配置持久化**：上述 Docker 配置将 `/root/.cli-proxy-api` 挂载到了宿主机的 `./auths`。这是为了保存你在网页端完成 OAuth 登录后获取的有效凭证，防止容器重启导致授权丢失。
- **定期更新**：由于 AI 平台（特别是 Claude 和 Gemini）的接口调整频繁，保持 `latest` 镜像更新是必要的：`docker compose pull && docker compose up -d`。

### 3.3 身份验证与账号配置

服务拉起后，我们需要获取调用凭据：

- 对于支持 OAuth 的平台，访问你服务器暴露的管理端点（或在本地启动一次再上传授权文件 `./auths`），跟随其提供的控制台引导完成基于浏览器的 OAuth 流程，获取 Claude Code 或 OpenAI Codex 的合法会话。
- 对于传统 API Key，你可以在挂载出来的 `config.yaml` 中配置多个 Key 以启用轮询负载均衡。

### 3.4 管理与可视化监控

为了保证代理服务器的稳定运行并监控各账号的额度消耗，开源社区提供了多个强大的周边可视化工具：

- **[CPA-Manager](https://github.com/seakee/CPA-Manager)**：完整的管理中心，提供请求级监控、费用预估、多账号池批量巡检及异常账号定位。
- **[CLIProxyAPI Dashboard](https://github.com/itsmylife44/cliproxyapi-dashboard)**：现代化的 Web 管理仪表盘，支持实时日志、API Key 管理及使用量分析。
- **[CPA Usage Keeper](https://github.com/Willxup/cpa-usage-keeper)**：独立的使用量持久化与可视化服务，定期同步数据到 SQLite 并提供仪表盘。

### 3.4 进阶应用：通过 Claude Code 消耗 Gemini CLI 额度

除了基本的配置和分发，CLIProxyAPI 的一个核心应用场景在于**格式转换与跨提供商调度**。这意味着你可以配置一个原本只支持 Anthropic 协议的工具（比如 Claude Code），让它在后台实际上调用由 Gemini CLI 提供的免费或 Pro 额度。

具体操作步骤如下：

#### 步骤 1：设置 Gemini CLI 的凭证
在终端运行 `cliproxyapi` 启动服务后，你需要登录你的 Google 账号来获取授权。如果本地配置尚未生成，你可以通过简单的 CLI 指令触发内置的 OAuth 流程。

```bash
# 启动 cliproxyapi
./cliproxyapi
```
*(在启动后的控制台中按提示完成授权登录即可)*

#### 步骤 2：在环境变量中配置 API 代理
在启动 Claude Code 之前，需要设置以下环境变量，将流量劫持到你的 CLIProxyAPI 端口（默认运行在 `8317` 端口）。这会覆盖 Claude Code 默认的 Anthropic 官方请求地址：

```bash
# 指定 API 代理地址，指向本地运行的 CLIProxyAPI
export ANTHROPIC_BASE_URL="http://127.0.0.1:8317"

# Token 可以随便填一个伪造的值，因为 CLIProxyAPI 内部会用它自己保存的 OAuth Credential
export ANTHROPIC_AUTH_TOKEN="sk-dummy"

# 针对 Claude Code 2.x 版本，我们需要显式映射对应的默认模型
# 把 Anthropic 的模型名称对应到你想白嫖的 Gemini 模型（采用当前最新模型）
export ANTHROPIC_DEFAULT_OPUS_MODEL="gemini-3.1-pro-preview"
export ANTHROPIC_DEFAULT_SONNET_MODEL="gemini-3-flash-preview"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="gemini-3.1-flash-lite-preview"

# (可选) 如果你还在使用 Claude Code 1.x 版本，则应配置以下变量：
export ANTHROPIC_MODEL="gemini-3.1-pro-preview"
export ANTHROPIC_SMALL_FAST_MODEL="gemini-3-flash-preview"
```

#### 步骤 3：享受跨越生态的畅快
配置完环境变量后，直接运行 `claude` 即可。

为了方便日常使用，我们提供了以下三种固定配置的方式：

**方法 A：Bash Alias (推荐用于快速切换)**
你可以将这些环境变量封装到一个便捷的启动别名中。在你的 `~/.bashrc` 或 `~/.zshrc` 中添加：

```bash
alias cpa-claude='export ANTHROPIC_BASE_URL="http://127.0.0.1:8317" \
export ANTHROPIC_AUTH_TOKEN="sk-dummy" \
export ANTHROPIC_DEFAULT_OPUS_MODEL="gemini-3.1-pro-preview" \
export ANTHROPIC_DEFAULT_SONNET_MODEL="gemini-3-flash-preview" \
export ANTHROPIC_DEFAULT_HAIKU_MODEL="gemini-3.1-flash-lite-preview" \
&& claude'
```
这样你只需要输入 `cpa-claude` 即可拉走代理的 Claude Code，而输入 `claude` 则依旧走官方 API。

**方法 B：全局配置 (推荐用于一劳永逸)**
你可以将上述 `export` 环境变量的内容直接写入到你的 `~/.bashrc` 或 `~/.zshrc` 中。这样任何时候你打开终端，所有的 Claude Code 调用都会默认走代理：

```bash
# 在 ~/.zshrc 或 ~/.bashrc 底部添加
export ANTHROPIC_BASE_URL="http://127.0.0.1:8317"
export ANTHROPIC_AUTH_TOKEN="sk-dummy"
export ANTHROPIC_DEFAULT_OPUS_MODEL="gemini-3.1-pro-preview"
export ANTHROPIC_DEFAULT_SONNET_MODEL="gemini-3-flash-preview"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="gemini-3.1-flash-lite-preview"
```

**方法 C：项目级局部配置**
如果不希望全局修改，你也可以在需要用到 AI 的项目根目录下建立 `.env` 文件，再配合 `direnv` 工具，在进入该目录时自动加载上述变量。

此时，Claude Code 发出的标准 Anthropic 格式请求会被转发到你的 `127.0.0.1:8317` 代理服务器。CLIProxyAPI 在接收到请求后，会自动：
1. 将 Anthropic 格式转换为 Google Gemini 支持的格式。
2. 使用你通过 OAuth 获取的凭证请求 Gemini CLI 接口。
3. 接收响应后，再将其转换为标准 Anthropic 格式还给 Claude Code。

这种玩法完美地桥接了不同工具生态，让你既能享受 Claude Code 的强劲工作流，又能完美利用手握的大量闲置 Google AI Pro（或 Gemini 免费额度）。

<img src="/images/cli-subagent/cli-subagent-workflow.svg" alt="CLIProxyAPI 配合 Claude Code 架构图" style="display:block;width:100%;height:auto;max-width:1200px;margin:0 auto 24px;object-fit:contain;">

### 3.5 常见问题与排错 (Troubleshooting)

在配置多模型代理时，你可能会遇到一些常见问题：

- **401 Unauthorized / Token Invalid**：请确保你的 `cliproxyapi` 后台服务正在运行，且已经正确完成了 OAuth 登录。如果提示凭证过期，请尝试重新登录。
- **端口冲突**：如果 `8317` 端口被占用，请在 `cliproxyapi` 配置中修改绑定端口，并同步更新环境变量 `ANTHROPIC_BASE_URL`。
- **模型不匹配或不支持的参数**：如果在运行 Claude Code 时提示找不到模型，请检查 `ANTHROPIC_DEFAULT_OPUS_MODEL` 等变量是否正确映射到了上游服务支持的 Gemini 模型名称（如 `gemini-3.1-pro-preview`）。

### 3.6 最佳实践与限制

- **并发与速率限制**：如果你使用免费账户的 OAuth 凭证，可能会遇到上游服务的速率限制（Rate Limits）。如果你高频使用自动补全或代码生成，建议绑定拥有足够额度的订阅账户（如 Google AI Pro）。
- **延迟考量**：由于存在一层代理转换，可能会带来少许的毫秒级延迟增加。不过相比于多账号调度带来的收益，这部分延迟在实际的 CLI 开发工作流中几乎可以忽略不计。

---

## 四、繁荣的周边生态与应用案例

CLIProxyAPI 的强大之处在于它极大地繁荣了 AI 编程工具的周边生态。许多优秀的开源项目都在它的基础上构建：

1. **桌面状态栏工具**
   - **Quotio / vibeproxy**：原生的 macOS 菜单栏应用，让你可以无需 API Key，直接调度 Claude / Gemini / OpenAI 订阅，支持实时配额追踪。
2. **IDE 与编辑器集成**
   - **Claude Proxy VSCode**：在 VSCode 中快速切换 Claude Code 模型的扩展，内置 CLIProxyAPI 作为后台引擎。
3. **桌面客户端管理**
   - **CodMate / LinJun (霖君)**：跨平台的桌面应用，用于统一管理 CLI AI 会话、多账户配额跟踪及提供商的一键配置集成。
4. **特殊场景应用**
   - **Subtitle Translator**：利用现有的 LLM 订阅翻译和校验字幕的桌面工具。
   - **Shadow AI**：为受限环境设计的隐蔽运行 AI 辅助工具，通过局域网实现跨设备的 AI 协作。

---

## 五、总结

**把不同入口的能力、额度和交互方式，重组为一个更像“系统”的工作流。**

CLIProxyAPI 很好地践行了这一理念。它让你购买的各类 AI Pro 订阅不再仅仅是“一个独立聊天窗口”的特权，而是真正变成了可以被各类 IDE、CLI 脚本和桌面工具随时调用的“底层计算产能”。

如果你也是一个重度依赖 AI 辅助编程的开发者，并且苦于多账号的额度管理与 API 适配，那么 CLIProxyAPI 绝对值得你加入到日常的基础设施中。

> 想要了解更详细的二次开发指南或自定义 Provider 接入，可查阅项目仓库中的 `docs/sdk-usage_CN.md` 等相关开发文档。