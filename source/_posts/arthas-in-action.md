---
title: Arthas in Action (Arthas 实战指南)
date: 2021-06-30 23:03:03
tags: [Java, 调试工具, Arthas]
categories: 开发工具
---

# Arthas 使用实战

Arthas 是阿里巴巴开源的一款强大的 Java 诊断工具，采用命令行交互模式，支持多种诊断功能。它不需要对现有代码进行任何修改，即可在运行时对 Java 应用进行深度探测。

本文将结合实际开发中常见的场景，介绍 Arthas 的核心用法。

## 1. 快速排查：Dashboard 与 Thread

当你发现系统 CPU 飙升或者响应变慢时，第一步通常是查看系统的整体运行情况。

### Dashboard
运行 `dashboard` 命令，可以实时查看系统的线程、内存、GC 情况以及运行环境。
```bash
$ dashboard
```

### Thread
如果发现某个线程占用 CPU 过高，可以使用 `thread` 命令进一步定位。
- `thread -n 3`：查看当前最忙的前三个线程，并打印堆栈。
- `thread -b`：找出当前阻塞其他线程的线程（死锁排查）。

## 2. 动态监测：Watch 与 Trace

这是 Arthas 最强大的地方，它允许你在不重启应用的情况下，观察方法的调用情况。

### Watch (观察方法参数/返回值)
如果你怀疑某个方法的参数传递错误或者返回值异常：
```bash
$ watch com.example.demo.UserController login "{params, returnObj, throwExp}" -n 5 -x 3
```
- `-n 5`：限制观察次数为 5 次。
- `-x 3`：展开对象的深度，方便查看复杂对象的内容。

### Trace (追踪方法调用耗时)
当某个接口响应慢，你想知道到底是哪一行代码或者哪个子方法耗时最长时：
```bash
$ trace com.example.demo.UserService getUserInfo
```
Arthas 会渲染出一棵调用树，标记出每一个子方法的耗时，帮助你精准定位性能瓶颈。

## 3. 在线代码诊断：Jad 与 Retransform

如果你怀疑生产环境的代码与 Git 分支不一致，或者想紧急修复一个简单的 Bug 而不想重新发布版本：

### Jad (反编译)
直接在终端查看运行中的类源码：
```bash
$ jad com.example.demo.UserService
```

### 线上热修复
利用 `mc` (Memory Compiler) 和 `retransform` 命令，你可以实现“在线热替换”：
1. 使用 `jad` 导出源码。
2. 手动修改源码文件。
3. 使用 `mc` 编译修改后的源码。
4. 使用 `retransform` 加载新的字节码。

## 4. 类加载信息：SC 与 SM

- `sc` (Search-Class)：查看类的信息、加载它的 ClassLoader。
- `sm` (Search-Method)：查看类中已加载的方法。

## 5. 经典实战案例 (精选自 GitHub User Case)

为了更好地理解 Arthas 的威力，我们来看看社区中一些真实的排错案例。

### 案例 A：接口性能优化十倍 (#1892)
**场景**：某系统的 Helios 接口在处理几十万个数据点时延迟达数秒。
**诊断**：开发者使用 `trace` 命令对接口链路进行深度追踪。结果发现，虽然数据库查询仅耗时 11ms，但大部分时间被耗在了程序的“数据组装”逻辑中。
**结果**：通过精确定位到耗时的方法块并进行重构，接口响应时间从数秒优化到了几十毫秒。

### 案例 B：多线程 WeakHashMap 导致的 CPU 跑满 (#1709)
**场景**：线上 K8s 环境某个节点 CPU 突然飙升至 100%，导致健康检查失败。
**诊断**：使用 `thread -n 3` 发现最忙的线程卡在 `org.apache.commons.beanutils.MethodUtils`。进一步使用 `sc -d` 查看类信息，发现应用中同时存在两个版本的 `commons-beanutils`。
**分析**：旧版本中的 `WeakHashMap` 在高并发 `get/put` 时可能陷入死循环。
**结果**：通过 `sc` 定位到 Jar 包冲突并排除低版本依赖，彻底解决了 CPU 异常。

### 案例 C：开发效率提升十倍：免重启调用 Spring 方法 (#1823)
**场景**：本地开发复杂业务（如 XXL-Job 任务或 Dubbo 服务）时，每次微调都要重启应用，非常耗时。
**技巧**：配合 IDEA Arthas 插件，利用 `ognl` 命令直接从 Spring Context 中获取 Bean 并触发目标方法。
**结果**：实现了“代码随写随测”，完全避免了频繁重启，研发效率提升极大。

## 总结

Arthas 就像是给运行中的 Java 虚拟机装上了一台 X 光机。无论是排查内存泄漏、CPU 异常，还是动态观测业务逻辑，它都能提供极大的便利。熟练掌握 Arthas，可以显著提升生产环境的问题定位效率。

## 参考来源
* [Arthas Github](https://github.com/alibaba/arthas)
* [Arthas Doc](https://arthas.aliyun.com/doc/)
