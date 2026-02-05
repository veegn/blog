---
title: 深度解析：修复 OpenClaw 中 Antigravity 模型“版本不再支持”故障
date: 2026-02-05 11:00:00
tags: [OpenClaw, Antigravity, Gemini, 故障排查, 逆向工程]
categories: 架构实践
---

# 深度解析：修复 OpenClaw 中 Antigravity 模型“版本不再支持”故障

## 1. 背景现象

在使用 OpenClaw 配置 Google 的 **Antigravity** 模型（通常对应 Gemini 3 Pro Preview 等前瞻模型）时，开发者可能会遇到如下报错：

> `This version of Antigravity is no longer supported. Please update to receive the latest features!`

即使 OpenClaw 本身已更新至最新版本，该错误仍可能持久存在。这通常意味着本地客户端向 Google 后端 API 发起请求时，所携带的版本元数据已低于服务端强制要求的准入阈值。

---

## 2. 深度原理分析

### 2.1 API 握手与 User-Agent 校验
OpenClaw 并非直接调用公开的 Gemini API，而是通过一个名为 `pi-ai` 的底层库，模拟 **Google Cloud Code Assist** 的协议进行通信。

在请求的 HTTP Header 中，服务端会严格校验 `User-Agent` 字段。对于 Antigravity 模式，其 Header 构造逻辑如下：
```javascript
"User-Agent": `antigravity/${version} darwin/arm64`
```
Google 的后端端点（如 `daily-cloudcode-pa.sandbox.googleapis.com`）会对 `${version}` 进行实时比对。一旦该版本号被标记为 **Deprecated**（废弃），服务端将直接返回 403 或自定义错误 JSON，导致本地 Agent 瘫痪。

### 2.2 为什么常规更新无效？
由于 `openclaw` 依赖于 `pi-ai` 库，而版本号通常硬编码在 `pi-ai` 的分发包中。如果 `pi-ai` 的上游维护者没有及时发布新版本并同步版本号，仅仅更新 `openclaw` 主程序是无法解决 Header 校验失败问题的。

---

## 3. 核心解决方案：源码级补丁

通过对 OpenClaw 依赖路径的静态分析，我们可以定位到硬编码该版本号的驱动文件。

### 3.1 定位驱动文件
在基于 NVM 管理的 Node.js 环境下，该文件通常位于：
`/home/veegn/.nvm/versions/node/v24.13.0/lib/node_modules/openclaw/node_modules/@mariozechner/pi-ai/dist/providers/google-gemini-cli.js`

### 3.2 确认最新准入版本
访问 **[Antigravity 更新日志](https://antigravity.google/changelog)**，获取当前最新的版本号（例如：`1.16.5` 或更高）。

### 3.3 手动修改常量
编辑上述 `google-gemini-cli.js` 文件，找到 `DEFAULT_ANTIGRAVITY_VERSION` 常量定义：

```javascript
// 修改前
const DEFAULT_ANTIGRAVITY_VERSION = "1.14.0"; // 假设这是过时的版本

// 修改后（根据 Changelog 同步）
const DEFAULT_ANTIGRAVITY_VERSION = "1.16.5"; 
```

### 3.4 另一种优雅方案：环境变量
根据源码中的 `getAntigravityHeaders()` 函数逻辑：
```javascript
const version = process.env.PI_AI_ANTIGRAVITY_VERSION || DEFAULT_ANTIGRAVITY_VERSION;
```
为了避免每次更新 npm 包都被覆盖，你也可以在 shell 配置文件（如 `.zshrc` 或 `.bashrc`）中永久注入环境变量：
```bash
export PI_AI_ANTIGRAVITY_VERSION="1.16.5"
```

---

## 4. 总结与反思

本次故障的根源在于 **云端协同演进的不对称性**。在 AI 代理（Agent）领域，客户端往往只是一个协议的模拟器。当 Google 等基础设施供应商快速迭代其内部 API 准入策略时，开源社区的响应速度可能会出现短时间滞后。

通过直接修改依赖包中的硬编码常量，我们实际上是完成了一次**欺骗性的版本声明**，使得服务端放行请求。这种“外科手术式”的修复方式是资深开发者应对快速迭代的 AI 生态时的必备技巧。

---

## 5. 参考文献

1.  *Google Antigravity. [Official Changelog](https://antigravity.google/changelog).*
2.  *Mario Zechner. [pi-ai Provider Implementation](https://github.com/mariozechner/pi-ai).*
3.  *IETF. [RFC 7231: Hypertext Transfer Protocol (HTTP/1.1) - User-Agent](https://datatracker.ietf.org/doc/html/rfc7231#section-5.5.3).*
