---
title: Arthas in Action (Arthas 终极实战指南)
date: 2021-06-30 23:03:03
tags: [Java, 调试工具, Arthas, 性能调优]
categories: 开发工具
---

# Arthas 使用实战：从入门到骨灰级

Arthas 是阿里巴巴开源的一款强大的 Java 诊断工具。它就像给运行中的 Java 虚拟机装上了一台 X 光机，帮助开发者在不重启、不改代码的情况下，深度观测系统行为。

---

## 🛠️ 核心命令快速参考手册

| 命令 | 场景 | 核心用途 |
| :--- | :--- | :--- |
| **`dashboard`** | 全景监控 | 实时查看 CPU、内存、GC、线程状态 |
| **`thread`** | 线程排查 | `thread -n 3` 查看最忙线程；`thread -b` 找死锁 |
| **`watch`** | 动态观测 | 实时监控方法的入参、返回值、异常抛出 |
| **`trace`** | 性能调优 | 渲染调用树，标记每一行/每一层的执行耗时 |
| **`stack`** | 路径回溯 | 查看当前方法被谁调用了（调用栈） |
| **`jad`** | 源码反查 | 线上反编译 Class 文件，确认发布版本是否正确 |
| **`retransform`** | 线上热更 | 不重启应用，动态替换 Class 文件（慎用） |
| **`profiler`** | 性能火焰图 | 生成 CPU 火焰图，定位真正的热点代码 |

---

## 🚀 场景化实战案例分类

### 1. CPU 与 性能调优（Performance Issues）
*   **案例：接口耗时从秒级优化到毫秒级 (#1892)**
    *   **方法**：使用 `trace` 命令。
    *   **实战**：通过 `trace com.business.Service queryData` 发现 90% 的耗时浪费在了一段无效的循环组装逻辑中。
*   **案例：死循环导致 CPU 跑满 (#1709)**
    *   **方法**：`thread -n 3` 定位到 `MethodUtils` 内部。
    *   **根因**：低版本 JDK 中的 `WeakHashMap` 在高并发下可能触发死循环。

### 2. 内存溢出与对象检查（Memory/OOM）
*   **案例：利用 `vmtool` 搜索内存对象**
    *   **场景**：怀疑某个单例配置被改了，但日志没记录。
    *   **技巧**：`vmtool --action getInstances --className com.config.AppConfig` 强制获取内存实例并直接调用其 `get()` 方法验证。
*   **案例：定位内存占用大户**
    *   **命令**：`memory` 查看各个内存区域（元空间、堆、非堆）的占比。

### 3. 业务逻辑与异常排查（Logical Bugs）
*   **案例：捕捉“消失”的异常 (#20)**
    *   **场景**：代码中有 `try-catch` 但漏掉了打印堆栈，导致流程中断但无迹可寻。
    *   **解决**：`watch com.pay.OrderService process "{params, throwExp}" -e` 实时拦截并打印出被吞掉的异常。
*   **案例：谁改了我的全局变量？**
    *   **方法**：使用 `watch` 观察静态字段的赋值变化。

### 4. 运行环境与类加载（Environment）
*   **案例：NoSuchMethodError 排查**
    *   **技巧**：使用 `sc -d com.utils.Helper` 查看该类究竟是从哪个 Jar 包、哪个路径加载的，彻底终结 Jar 包冲突。
*   **案例：运行时动态调整日志级别**
    *   **场景**：线上出问题但级别是 INFO，看不见 DEBUG 日志。
    *   **解决**：`logger --name root --level debug` 实时开启详细日志，收集证据后再切回。

---

## 🔥 骨灰级进阶技巧

### 1. 活用 OGNL 表达式
OGNL 是 Arthas 的灵魂。你可以用它实现很多神级操作：
- **查看静态变量**：`ognl '@com.Main@CONFIG_MAP'`
- **调用静态方法**：`ognl '@com.Helper@generateId()'`
- **从 Spring Context 拿 Bean**：如果应用暴露了获取 Context 的静态方法，你可以直接调用里面的 Bean 逻辑。

### 2. 生成火焰图（Flame Graph）
当你要进行大规模压测调优时，单一的 `trace` 已经不够看了：
```bash
$ profiler start
# 等待一段时间
$ profiler stop --format html
```
通过生成的 SVG 火焰图，哪些方法占据了 CPU 的“大平原”一目了然。

---

## ⚠️ 常见坑位与注意事项（必看）

1.  **Attach 失败**：
    *   如果是 Docker 容器，确保使用的是相同的用户启动 Arthas。
    *   如果提示 `The VM does not support the attach mechanism`，检查是否安装了完整的 JDK（Arthas 需要 `tools.jar`）。
2.  **性能损耗**：
    *   `trace` 和 `watch` 是通过字节码增强实现的，**会有一定的性能开销**。在高并发生产环境，建议使用 `-n` 限制采样次数，任务完成后务必执行 `stop` 或 `reset`。
3.  **类加载器问题**：
    *   如果发现搜不到类，尝试使用 `-c <classloader-hash>` 指定特定的类加载器。

---

## 总结

Arthas 是一把双刃剑：用得好，它是线上救火的神器；用不好，可能导致应用性能抖动。建议在开发和测试环境多加练习，熟练掌握 OGNL 和场景化命令组合。

## 参考来源
* [Arthas Github](https://github.com/alibaba/arthas)
* [Arthas User Cases](https://github.com/alibaba/arthas/issues?q=label%3Auser-case)
* [OGNL 官方指南](https://commons.apache.org/proper/commons-ognl/language-guide.html)
