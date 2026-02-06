---
title: 全球及各地区公共 DoH 服务器汇总与实战评测 (2026版)
tags:
  - 网络安全
  - DNS
  - DoH
  - 隐私保护
categories: 技术干货
abbrlink: 862f2f48
date: 2026-02-05 10:00:00
description: 2026年最新全球及国内公共 DoH (DNS over HTTPS) 服务器汇总，包含阿里云、360、腾讯云、Google 等主流厂商地址，并提供上海节点实测连通性数据。
keywords: DoH 地址, 公共 DNS, 加密查询, 隐私保护, DNSPod, 阿里DNS, 360DNS
---

# 全球及各地区公共 DoH 服务器汇总与实战评测 (2026版)

## 1. 什么是 DoH (DNS over HTTPS)？

**DoH (DNS over HTTPS)** 是一种通过加密的 HTTPS 协议进行域名解析的方案。传统的 DNS 查询通过 UDP/TCP 53 端口发送，是明文的，极易受到运营商劫持、中间人攻击或流量监控。

DoH 的核心优势包括：
*   **隐私性**：查询内容被 TLS 加密，第三方（包括 ISP）无法窥视你访问了哪些域名。
*   **安全性**：防止 DNS 投毒和劫持，确保获取到最准确的解析结果。
*   **规避审查**：由于 DNS 流量混杂在 HTTPS 流量中，防火墙很难对其进行有针对性的干扰。

<!-- more -->

---

## 2. 2026 年主流 DoH 服务器汇总与实测

以下数据基于上海电信网络环境实测（测试时间：2026-02-06），通过自动化脚本进行多轮探测取平均值。

### 🇨🇳 国内推荐（极速、高可靠）

对于国内用户，首选大厂提供的 DoH，确保最低的解析延迟和最佳的 CDN 调度。

| 厂商 | DoH 地址 | 实测延迟 (上海) | 特点 |
| :--- | :--- | :--- | :--- |
| **阿里云 (AliDNS)** | `https://dns.alidns.com/dns-query` | **86.95 ms** | 响应极快，节点最丰富，首选推荐 |
| **360 安全 DNS** | `https://doh.360.cn/dns-query` | **118.41 ms** | 非常稳定，兼顾恶意网站拦截 |
| **腾讯云 (DNSPod)** | `https://doh.pub/dns-query` | **204.17 ms** | 稳定性标杆，解析精准 |

### 🌐 国际参考（强隐私、适合特殊环境）

以下服务器由于跨境网络波动，直连延迟较高，**强烈建议在具备加速（Proxy）环境下使用**。

| 厂商 | DoH 地址 | 实测延迟 (直连) | 特点 |
| :--- | :--- | :--- | :--- |
| **Google** | `https://dns.google/dns-query` | 1376.18 ms | 兼容性标杆，直连存在丢包风险 |
| **AdGuard DNS** | `https://dns.adguard-dns.com/dns-query` | 1999.26 ms | 自带广告拦截，直连成功率较低 |
| **OpenDNS** | `https://doh.opendns.com/dns-query` | 2141.34 ms | 国际老牌，作为备份方案 |
| **Cloudflare** | `https://cloudflare-dns.com/dns-query` | 2428.60 ms | 隐私政策最严，直连基本不可用 |
| **NextDNS** | `https://dns.nextdns.io` | ❌ 阻断 | 已被彻底屏蔽，无法直连访问 |

> **实战建议**：在国内日常使用中，**请务必首选阿里云或 360 DNS**。如果你需要访问海外网站且对隐私有极高要求，建议在代理软件（如 Clash/V2Ray）中配置 **Google** 或 **Cloudflare** 的 DoH 地址，而非在系统层面直接配置。

---

## 3. 如何在你的设备上启用 DoH？

### Chrome / Edge 浏览器
1.  进入 `设置` -> `隐私和安全` -> `安全`。
2.  找到 `使用安全 DNS`。
3.  选择 `自定义`，并填入上述地址（如 `https://dns.alidns.com/dns-query`）。

### Windows 11
1.  进入 `设置` -> `网络和 Internet` -> `以太网/Wi-Fi`。
2.  点击 `DNS 服务器分配` 下的 `编辑`。
3.  将 DNS 设置为手动，开启 IPv4，填入 DNS IP（如阿里的 `223.5.5.5`），然后将 `DNS over HTTPS` 选项设置为 `开启(自动)`。

---

## 4. 总结

DoH 是目前保护个人网络隐私最简单也最有效的方法之一。在 2026 年，国内大厂对 DoH 的支持已经非常成熟。建议普通用户至少在浏览器端开启国内大厂的 DoH，以获得更纯净的上网体验。

---
**参考文献**
1. [RFC 8484: DNS Queries over HTTPS (DoH)](https://datatracker.ietf.org/doc/html/rfc8484).
2. [DNSPerf: Global Public DNS Performance Rankings](https://www.dnsperf.com/#!dns-resolvers).
3. [Cloudflare DNS Privacy Policy](https://www.cloudflare.com/privacypolicy/).
4. [Google Public DNS Privacy Notice](https://developers.google.com/speed/public-dns/privacy).
