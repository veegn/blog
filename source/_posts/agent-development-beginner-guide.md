---
title: 从新手到入门：AI Agent 开发全指南
date: 2026-05-20 14:00:00
tags:
  - AI
  - Agent
  - 开发指南
  - 教程
categories:
  - AI 技术
---

# 从新手到入门：AI Agent 开发全指南

在 2026 年的今天，AI 技术正经历从“对话式大模型”向“自主智能体（AI Agent）”的范式转变。传统的 LLM（大语言模型）像是一个坐在封闭房间里的智者，你可以向他提问，他用已有的知识回答你；而 AI Agent 则像是给这位智者配上了手机、电脑、笔记本和双腿，让他不仅能思考，还能主动去执行任务、获取最新信息并解决复杂问题。

如果你是一名开发者，理解并掌握 Agent 的开发，将是你构建下一代智能化应用的核心竞争力。本文将带你从理论到实践，循序渐进地揭开 AI Agent 的神秘面纱。

## 第一部分：理论基石 —— AI Agent 的核心架构

要开发 Agent，首先需要理解它的解剖结构。目前业界公认的 Agent 架构主要包含四个核心组件：**大脑（LLM）、记忆（Memory）、规划（Planning）和工具（Tools/Action）**。

### 1. 核心大脑：LLM (Large Language Model)
LLM 是 Agent 的控制中心。所有的思考、推理、决策都是由 LLM 完成的。对于 Agent 来说，模型的逻辑推理能力（Reasoning）和指令遵循能力（Instruction Following）比单纯的知识储备更重要。目前主流的基座模型如 Claude 3.5/4.x 系列或 GPT-4o 都是非常优秀的 Agent 大脑。

### 2. 记忆系统：Memory
Agent 需要记住过去发生的事情才能连贯地完成复杂任务。记忆通常分为两种：
*   **短期记忆（Short-term Memory）**：通常指对话的上下文（Context）。由于模型的 Context Window 长度有限，短期记忆主要用于维持当前的执行状态和多轮对话的连贯性。
*   **长期记忆（Long-term Memory）**：当信息量超出了上下文限制，就需要引入长期记忆。这通常通过外部存储（如向量数据库 Vector Database）配合 RAG（检索增强生成）技术来实现。Agent 可以将历史经验存储起来，并在未来需要时“回想”起来。

### 3. 规划能力：Planning
面对一个复杂的宏大目标，Agent 需要像人类一样，将其拆解为一个个可执行的小步骤。
*   **任务分解（Task Decomposition）**：将大任务拆分为子任务（Subgoals）。
*   **反思与纠错（Self-Reflection）**：在执行过程中，如果某个步骤失败了，Agent 应该能够分析原因并调整计划，而不是卡死。
*   **ReAct 模式（Reasoning + Acting）**：这是最经典的 Agent 思考框架。Agent 会先“思考（Thought）”当前需要做什么，然后“行动（Action）”，观察行动的“结果（Observation）”，最后再基于结果进行下一步的思考，循环往复直至任务完成。

### 4. 外部工具：Tools / Action
这是 Agent 产生实际影响力的关键。如果不给工具，LLM 就只能“纸上谈兵”。通过定义清晰的工具接口（Function Calling / Tool Use），Agent 可以：
*   通过 Search API 获取实时新闻。
*   通过 Python 解释器运行代码来分析数据。
*   通过外部系统的 API 操作数据库、发送邮件或控制智能家居。

---

## 第二部分：从零开始的实战演练

理论讲完，我们开始动手。本节我们将不依赖臃肿的框架，直接使用原生的 Anthropic API（Claude 模型）和 Python，带你徒手构建一个能查询天气的简单 Agent。

### 准备工作
*   安装 Python 3.9+。
*   获取一个 Anthropic API Key。
*   安装依赖：`pip install anthropic requests`

### Step 1: 让模型认识工具 (Function Calling)

首先，我们需要准备一个实际的 Python 函数，充当 Agent 的“工具”。为了简单，我们模拟一个天气 API。

```python
import json

# 1. 定义一个实际的 Python 函数（工具）
def get_weather(location: str) -> str:
    """模拟一个天气查询 API"""
    print(f"[执行工具] 正在查询 {location} 的天气...")
    # 实际应用中，这里会发起真实的 HTTP 请求
    weather_data = {
        "北京": "晴天，25°C，适合出行",
        "上海": "阴有阵雨，20°C，记得带伞",
        "深圳": "暴雨，28°C，请注意安全"
    }
    return weather_data.get(location, f"抱歉，找不到 {location} 的天气信息。")
```

接下来，我们需要按照 LLM 的格式要求，将这个工具描述给模型。这样模型才知道自己“手里有什么牌”。

```python
# 2. 定义工具的 Schema（告诉模型这个工具是干什么的，需要什么参数）
weather_tool_schema = {
    "name": "get_weather",
    "description": "获取指定城市的当前天气情况。",
    "input_schema": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "需要查询天气的城市名称，例如：北京、上海"
            }
        },
        "required": ["location"]
    }
}
```

### Step 2: 构建 Agent 的核心循环 (The Loop)

Agent 的执行本质上是一个 `Thought -> Action -> Observation -> Final Answer` 的循环。我们需要编写代码来驱动这个过程。

```python
import anthropic

client = anthropic.Anthropic(api_key="YOUR_API_KEY")
MODEL_NAME = "claude-3-5-sonnet-20241022" # 推荐使用适合 Agent 的模型

def run_agent(user_query: str):
    print(f"用户提问: {user_query}")
    
    # 初始化对话历史，也就是 Agent 的短期记忆
    messages = [{"role": "user", "content": user_query}]

    # 开始执行循环
    while True:
        print("\n--- Agent 正在思考 ---")
        # 1. 调用模型，传入对话历史和可用的工具
        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=1024,
            messages=messages,
            tools=[weather_tool_schema]
        )

        # 检查模型的回复类型
        if response.stop_reason == "tool_use":
            # 模型决定调用工具
            tool_use = next(block for block in response.content if block.type == "tool_use")
            tool_name = tool_use.name
            tool_input = tool_use.input
            tool_use_id = tool_use.id

            print(f"[Agent 决定行动] 准备调用工具: {tool_name}, 参数: {tool_input}")

            # 将模型的调用请求也存入历史记忆
            messages.append({"role": "assistant", "content": response.content})

            # 2. 在本地执行对应的 Python 函数
            if tool_name == "get_weather":
                # 提取参数并执行
                location = tool_input["location"]
                result = get_weather(location)
                print(f"[工具返回结果] {result}")

                # 3. 将工具的执行结果（Observation）返回给模型
                messages.append({
                    "role": "user",
                    "content": [
                        {
                            "type": "tool_result",
                            "tool_use_id": tool_use_id,
                            "content": result
                        }
                    ]
                })
            else:
                raise ValueError(f"未知的工具: {tool_name}")
                
        elif response.stop_reason == "end_turn":
            # 模型已经得出了最终答案
            final_text = next(block.text for block in response.content if block.type == "text")
            print(f"\n[Agent 最终回答]:\n{final_text}")
            break

# 测试我们的 Agent
if __name__ == "__main__":
    run_agent("我明天要去上海出差，帮我看看天气怎么样，需要准备什么？")
```

### 运行原理解析

当你运行这段代码时，你会清晰地看到 Agent 的“思考”过程：

1.  **第一次模型调用**：模型分析了你的需求（去上海，问天气），发现自己无法直接回答，但发现手里有一个 `get_weather` 工具。于是，它停止生成文本，向你（代码框架）发起了一个 Tool Use 请求，参数为 `{"location": "上海"}`。
2.  **代码执行**：我们的 Python 循环捕获到了这个请求，在本地调用了 `get_weather("上海")`，得到了“阴有阵雨...”。
3.  **第二次模型调用**：我们将这个结果打包成 `tool_result` 格式，再次发给模型。
4.  **得出结论**：模型现在知道了上海的天气，于是它结合你的问题（“需要准备什么？”），生成了最终的自然语言回答：“上海明天阴有阵雨，温度大约 20°C。建议您出差时务必带上一把雨伞，并准备一件长袖外套以防着凉...”

这就是一个最原汁原味、没有被框架黑盒封装的 ReAct Agent！

---

## 第三部分：进阶之路 —— 走向工程化

手动管理 `while` 循环和解析 JSON 虽然能让你理解底层原理，但在实际的企业级开发中，我们需要处理更复杂的情况（如并发工具调用、长记忆截断、复杂的条件流转等）。这时候，成熟的 Agent 框架就派上用场了。

### 主流框架概览

*   **LangChain / LangGraph**：目前生态最繁荣的框架。LangGraph 特别强调将 Agent 的执行流建模为“图（Graph）”，非常适合处理包含循环和复杂状态机逻辑的 Multi-Agent 系统。
*   **LlamaIndex**：原本专注于 RAG，现在也补齐了强大的 Agent 能力，如果你的 Agent 核心任务是在大量文档中穿梭，它是首选。
*   **CrewAI** / **AutoGen**：专注于“多智能体协作（Multi-Agent System）”。你可以定义一个 Manager 角色、一个 Coder 角色和一个 Tester 角色，让它们像一个小型公司一样围绕一个目标进行自动化的讨论和协作。

### 开发者建议

1.  **不要迷信框架**：在刚入门时，强烈建议像本文一样，用原生代码写几遍 API 调用。过度封装的框架往往会让 Debug 变得痛苦不堪。理解了底层原理，再用框架才能得心应手。
2.  **Prompt 工程依然是王道**：即使是 Agent，决定其下限的仍然是你的 System Prompt。详细地告诉 Agent 它的目标是什么、遇到边界情况怎么处理、以什么格式输出，比写复杂的 Python 逻辑更有效。
3.  **从单一职责开始**：不要一上来就想造一个全能的贾维斯。先做一个只专注解决一个具体问题的小 Agent（比如专门查天气、专门读写某个数据库），然后通过路由（Routing）或编排将它们组合起来。

## 结语

从大模型到智能体，AI 正在从“阅读理解”走向“动手实践”。掌握 Agent 开发，意味着你不仅能与 AI 对话，更能雇佣 AI 为你打工。希望这篇指南能成为你开启 Agent 开发之旅的完美起点。

接下来，试着为你刚才写的 Agent 加上一个 `search_web` 的工具，让它拥有真正的联网能力吧！