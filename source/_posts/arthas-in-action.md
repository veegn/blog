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

## 总结

Arthas 就像是给运行中的 Java 虚拟机装上了一台 X 光机。无论是排查内存泄漏、CPU 异常，还是动态观测业务逻辑，它都能提供极大的便利。熟练掌握 Arthas，可以显著提升生产环境的问题定位效率。

## 参考来源
* [Arthas Github](https://github.com/alibaba/arthas)
* [Arthas Doc](https://arthas.aliyun.com/doc/)
