---
title: Arthas in Action (Arthas 实战指南)
date: 2021-06-30 23:03:03
tags: [Java, 调试工具, Arthas]
categories: 开发工具
---

# Arthas 使用实战

Arthas 是阿里巴巴开源的一款强大的 Java 诊断工具，支持多种诊断功能。它不需要对现有代码进行任何修改，即可在运行时对 Java 应用进行深度探测。

## 核心命令快速参考

- `dashboard`：实时系统面板。
- `thread -n 3`：查看最忙的前 3 个线程。
- `watch className methodName "{params, returnObj}"`：观察方法调用。
- `trace className methodName`：追踪方法耗时。
- `jad className`：反编译代码。
- `retransform /path/to/class`：线上热替换。

---

## 🚀 场景化实战案例分类

为了更好地应用 Arthas，我们将使用案例按照排查场景进行分类。

### 1. CPU 与 性能调优（Performance Issues）
**场景描述**：系统负载高，接口响应慢。

*   **案例：接口耗时从秒级优化到毫秒级 (#1892)**
    *   **方法**：使用 `trace` 追踪整个调用链路。
    *   **发现**：发现 90% 的耗时在一段本该由缓存处理但却在重复组装数据的逻辑中。
    *   **命令**：`trace com.business.Service queryData`
*   **案例：死循环导致 CPU 跑满 (#1709)**
    *   **方法**：`thread -n 3` 定位到 `MethodUtils` 中的 `WeakHashMap`。
    *   **发现**：旧版 JDK/依赖包在高并发下 `WeakHashMap` 可能陷入死循环。

### 2. 内存溢出与对象检查（Memory/OOM）
**场景描述**：内存持续增长，怀疑内存泄漏，或需要查看内存中某个对象的状态。

*   **案例：没源码也能排查偶发耗时问题**
    *   **方法**：使用 `vmtool` 强制获取内存中的对象实例。
    *   **场景**：某规则引擎对象在内存中重复创建，通过 `vmtool` 获取实例并调用其 `size()` 方法发现缓存策略失效。
    *   **命令**：`vmtool --action getInstances --className com.rule.Engine`
*   **案例：查看 HeapDump 前的快速诊断**
    *   **方法**：使用 `memory` 和 `dashboard` 查看非堆内存和元空间使用情况。

### 3. 业务逻辑与异常排查（Logical Bugs）
**场景描述**：方法返回了预期之外的值，或是有报错但没打印日志。

*   **案例：捕捉“消失”的异常**
    *   **场景**：代码中有 `try-catch` 但没打印堆栈，导致业务逻辑断掉却找不到原因。
    *   **方法**：使用 `watch` 拦截异常抛出。
    *   **命令**：`watch com.pay.OrderService process "{params, throwExp}" -e`
*   **案例：动态验证入参**
    *   **场景**：怀疑某个上游服务传了空值。
    *   **方法**：直接观察方法的入参。

### 4. 运行环境与类加载（Environment）
**场景描述**：Jar 包冲突，或是想确认配置文件是否生效。

*   **案例：排除“幽灵” Jar 包**
    *   **场景**：系统报错 `NoSuchMethodError`，怀疑加载了旧版本 Jar。
    *   **方法**：使用 `sc -d` 查看类的加载来源。
    *   **命令**：`sc -d com.utils.Helper`
*   **案例：运行时动态调整日志级别**
    *   **方法**：使用 `logger` 命令实时修改 Logback/Log4j 级别而无需重启。
    *   **命令**：`logger --name com.business --level debug`

### 5. 极致效率：本地开发免重启（Hotfix/Efficiency）
**场景描述**：修复一个小 Bug 还要重启 5 分钟，或者想直接调用一个私有方法。

*   **案例：免重启调用 Spring Bean 方法 (#1823)**
    *   **技巧**：利用 `tt`（TimeTunnel）或 `ognl` 拿到 `ApplicationContext`，直接触发目标逻辑。
    *   **结果**：对于复杂的 XXL-Job 或异步回调，直接手动触发测试，效率提升 10 倍。
*   **案例：线上热修复（Hotfix）**
    *   **步骤**：`jad` 导出源码 -> 修改 -> `mc` 编译 -> `retransform` 加载。

---

## 总结

Arthas 不仅仅是一个调试工具，它更像是一套**运行时的手术台**。通过将命令与场景结合，我们可以从容应对各种高压下的线上事故。

## 参考来源
* [Arthas Github](https://github.com/alibaba/arthas)
* [Arthas Doc](https://arthas.aliyun.com/doc/)
