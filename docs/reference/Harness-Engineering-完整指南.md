# Harness Engineering 完整指南

> 本指南整合自 OpenAI 官方博客及多篇权威文章，涵盖核心概念、方法论与最佳实践。

---

## 一、核心理念

### AI 的真正问题

**AI 最大的问题，从来不是"不会做"，而是"每次都做得不一样"。**

你大概率经历过这种状态：有时候 AI 非常惊艳，有时候又让人抓狂。你让它写功能，它完成了；你让它改一下，它开始偏离；你补充更多说明，结果却更不稳定。

### 核心洞察

> **与其教它怎么做，不如设计一个让它自然做对的环境。**

决定 Agent 行为的，不是你写了什么，而是它"身处什么环境"。

---

## 二、为什么传统方法失效

### Agent 与人类工程师的本质差异

| 人类工程师 | Agent |
|-----------|-------|
| 阅读 → 理解 → 设计 → 实现 | 观察 → 尝试 → 调用工具 → 获得反馈 → 修正 |
| 线性读完说明 | 不会线性读完说明 |
| 建立完整全局理解 | 不会建立完整理解 |
| 长期记住规则 | 不会长期记住规则 |

**Agent 只是在当前上下文里，做一个"看起来合理的下一步"。**

### Agent 的三种失败模式

| 失败模式 | 描述 | 后果 |
|----------|------|------|
| **One-shotting** | 试图一次性完成所有任务 | 复杂任务必然失败 |
| **过早宣布胜利** | 主观认为完成，未验证 | 任务实际未完成 |
| **上下文腐烂** | 长对话后指令遗忘 | 行为偏离预期 |

### HashiCorp 创始人的洞察

> "每次 Agent 犯错，你都应该设计一个系统，让它永远不再犯同样的错误。" — Mitchell Hashimoto

---

## 三、三层工程的演进

### 层级结构

```
┌─────────────────────────────────────────────┐
│           Harness Engineering               │
│        "在什么环境里做事"                      │
│  ┌───────────────────────────────────────┐  │
│  │        Context Engineering             │  │
│  │          "知道什么"                     │  │
│  │    ┌─────────────────────────────┐    │  │
│  │    │     Prompt Engineering      │    │  │
│  │    │        "怎么说清楚"          │    │  │
│  │    └─────────────────────────────┘    │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 各层对比

| 层级 | 核心职责 | 解决的问题 | 局限性 |
|------|----------|------------|--------|
| **Prompt Engineering** | 明确任务目标与输入表达 | 单次对话质量 | 多轮后上下文混乱 |
| **Context Engineering** | 动态组装上下文（RAG、多轮管理） | 知道什么 | Agent 行为仍不可控 |
| **Harness Engineering** | 系统级约束与状态管理 | 在什么环境里做事 | — |

**包含关系**：Prompt ⊂ Context ⊂ Harness

---

## 四、四大支柱

**如果把 LLM 比作 CPU，Harness 就是操作系统。**

### 支柱一：Context Architecture（上下文架构）

**目标**：给 Agent 一张地图，而不是一本 1000 页的说明书。

**核心要素**：
- **AGENTS.md**：约 100 行的入口文件，作为地图
- **渐进式披露**：入口 → 索引 → 详细文档，按需加载

**关键洞察**：上下文窗口利用率超过 40% 后，模型表现急剧下降（Dumb Zone）。通过渐进式披露保持在 Smart Zone。

### 支柱二：Agent Specialization（Agent 专业化）

**目标**：通过限制范围确保高效。

**核心原则**：
- **角色分工**：不同 Agent 负责不同任务
- **工具受限**：每个 Agent 只能访问特定工具
- **保持在 Smart Zone**：通过限制上下文负载确保高效

**实践示例**：
- 代码审查 Agent：只读权限 + linter 工具
- 测试 Agent：测试框架 + 覆盖率工具
- 重构 Agent：特定文件 + 验证脚本

### 支柱三：Persistent Memory（持久化记忆）

**目标**：跨会话记忆，崩溃后可恢复。

**核心组件**：
- **进度文件**：`progress.json` 记录任务状态
- **Git 日志**：版本控制作为外部记忆

**示例**：
```json
{
  "session_id": "refactor-001",
  "completed": ["task-1", "task-2"],
  "pending": ["task-3", "task-4"],
  "current_focus": "task-3",
  "last_error": null
}
```

### 支柱四：Structured Execution（结构化执行）

**目标**：先分析再行动，每步都有反馈。

**执行流程**：
```
理解 → 规划 → 执行 → 验证 → 检查点
  ↑                              │
  └──────────────────────────────┘
```

---

## 五、实践方法

### 5.1 代码仓库布局

**核心原则**：渐进式披露，按需加载。

```
代码仓库根目录/
│
├── AGENTS.md                    # 入口文件（约 100 行）
│   ├── 内容目录/地图
│   └── 指向 → docs/ 目录
│
├── docs/                        # 结构化知识库
│   ├── design/                  # 设计文档（编目和索引）
│   │   ├── README.md           # 设计文档索引
│   │   ├── feature-001.md      # 功能设计文档
│   │   └── feature-002.md
│   │
│   ├── architecture/            # 架构文档（域和包分层）
│   │   ├── README.md           # 架构文档索引
│   │   ├── domain-layers.md    # 业务域分层说明
│   │   └── dependencies.md     # 依赖关系图
│   │
│   ├── plans/                   # 执行计划（进度和决策日志）
│   │   ├── README.md           # 计划索引
│   │   ├── sprint-001.md       # 冲刺计划
│   │   └── decisions.md        # 决策日志
│   │
│   └── tech-debt/               # 技术债务追踪
│       ├── README.md           # 债务索引
│       └── backlog.md          # 待处理清单
│
├── .claude/                     # Claude Code 配置
│   ├── CLAUDE.md               # Claude 指令文件
│   └── skills/                 # 技能模块
│
└── scripts/                     # 工具脚本
    └── ralph/                   # Ralph Loop 配置
        ├── ralph.sh            # 主循环脚本
        ├── prompt.md           # 提示模板
        ├── prd.json            # 任务清单
        └── progress.txt        # 进度日志
```

### 5.2 AGENTS.md 完整示例

```markdown
# 项目名称 - Agent 指南

## 快速开始
简要说明如何开始工作，包括环境配置、依赖安装等。

## 项目结构
目录结构概述和各目录用途：
- `src/` - 源代码目录
- `tests/` - 测试代码
- `docs/` - 文档
- `scripts/` - 脚本工具

## 核心概念
- 架构模式：DDD + Clean Architecture
- 关键抽象：聚合根、领域事件、仓储
- 设计原则：SOLID、DRY、KISS

## 开发规范
- 代码风格：遵循 PEP8 / ESLint 规则
- 命名约定：驼峰命名、语义化命名
- 测试要求：覆盖率 > 80%

## 知识库索引
- [设计文档](./docs/design/README.md)
- [架构文档](./docs/architecture/README.md)
- [执行计划](./docs/plans/README.md)
- [技术债务](./docs/tech-debt/README.md)

## 黄金原则
1. 倾向使用共享实用程序包，而非手工编写辅助工具
2. 验证边界或依赖类型化 SDK
3. 不使用"YOLO 式"探测数据
4. 每次提交必须通过 CI 检查
```

### 5.3 Skill 目录结构

```
.skills/
└── code-refactor-agent/
    ├── SKILL.md              # Skill 入口，按需加载到上下文
    ├── rules/
    │   ├── python-style.md   # Python 代码规范
    │   └── refactor-patterns.md  # 重构模式库
    ├── tools/
    │   ├── analyze_code.py   # 代码分析工具
    │   ├── run_tests.sh      # 测试执行包装器
    │   └── rollback.py       # 安全回滚工具
    └── templates/
        └── refactor_plan.md  # 重构计划模板
```

### 5.4 SKILL.md 完整示例

```markdown
# Code Refactor Agent Skill

## 激活条件
当用户要求"优化代码"、"重构遗留代码"或"改进代码质量"时激活。

## 系统原则
1. **最小破坏原则**：每次只重构一个函数/类，确保测试通过后再继续
2. **状态持久化**：每次会话结束必须更新 `progress.json`
3. **失败熔断**：如果测试连续失败 3 次，立即停止并请求人工干预

## 工具使用规范
- 代码分析：优先使用 `analyze_code.py`，而非让 LLM 直接读文件
- 测试验证：必须通过 `run_tests.sh` 验证
- 版本控制：每次成功重构后自动提交

## 安全边界（Guardrails）
- 禁止修改 `requirements.txt` 和配置文件
- 禁止删除已有测试文件
- 遇到 `FIXME` 或 `HACK` 注释时，必须标记为需要人工审查
```

### 5.5 状态管理：progress.json

```json
{
  "session_id": "refactor-legacy-001",
  "target_file": "legacy_module.py",
  "completed": [
    {
      "function": "process_data",
      "commit": "a1b2c3d",
      "timestamp": "2026-03-20T10:00:00Z",
      "tests_passed": true
    }
  ],
  "pending": [
    "optimize_query_builder",
    "extract_constants_from_config"
  ],
  "current_focus": "optimize_query_builder",
  "attempt_count": 0,
  "last_error": null
}
```

### 5.6 Agent 自治工作流

**初始化阶段（仅执行一次）**：
1. 读取 SKILL.md 和 progress.json
2. 运行 analyze_code.py 生成问题清单
3. 写入 progress.json 制定分阶段计划

**执行阶段（循环执行，可跨会话）**：
1. 加载 progress.json 恢复状态
2. 选取下一个 pending 任务
3. 实施重构 → 运行 run_tests.sh 验证
4. 如果测试通过：git commit + 更新 progress.json
5. 如果测试失败：查看错误输出 → 重试（最多 3 次）
6. 优雅退出，保存状态供下次会话继续

---

## 六、OpenAI 实践案例

### 核心数据

| 指标    | 数据                   |
| ----- | -------------------- |
| 代码行数  | **约 100 万行**         |
| 时间效率  | 约手工编写的 **1/10**      |
| PR 数量 | **1,500+**           |
| 团队规模  | **3-7 名工程师**         |
| 吞吐量   | 每位工程师每天 **3.5 个 PR** |

### 核心理念

> **人类掌舵。智能体执行。**

每一行代码—从应用逻辑、测试、CI 配置、文档到内部工具—全由 Codex 编写。

### 关键实践

**1. 提高可读性**
- 应用程序可根据 git worktree 启动实例
- 通过 Chrome DevTools 协议获取 DOM 快照、截图
- 使用 LogQL/PromQL 查询日志和指标

**2. 规范架构**
每个业务域划分固定层级，依赖方向严格验证：
```
Types → Config → Repo → Service → Runtime → UI
```
横切关注点通过单一显式接口（Providers）接入。

**3. 熵与垃圾收集**
- 将"黄金原则"编码到代码仓库
- 后台任务持续扫描偏差并发起修复 PR
- 像垃圾回收一样持续偿还技术债务

---

## 七、开发者角色转变

> **不再写代码，而是设计"能写代码的系统"。**

| 传统职责 | 新职责 |
|----------|--------|
| 编写代码 | 设计环境 |
| 调试代码 | 明确意图 |
| Code Review | 构建反馈回路 |
| "再努力一点" | "还需要什么能力？" |

### 核心经验教训

1. **情境管理**：给智能体地图，不是说明书
2. **架构约束**：有了约束，速度才不会下降
3. **可读性优先**：首先针对智能体可读性优化
4. **品味编码**：人类品味一旦被捕捉，持续应用于每行代码

---

## 八、速查表

### 核心概念

| 概念 | 定义 | 关键实践 |
|------|------|----------|
| **Harness Engineering** | 系统级环境设计 | 四大支柱 |
| **Smart Zone** | 上下文利用率 < 40% | 渐进式披露 |
| **AGENTS.md** | 约 100 行入口文件 | 地图而非说明书 |
| **Persistent Memory** | 跨会话记忆 | progress.json + Git |

### 核心原则

| 原则 | 说明 |
|------|------|
| **最小破坏** | 每次只改动一小部分 |
| **状态持久化** | 每步都保存进度 |
| **失败熔断** | 连续失败 N 次后请求人工干预 |
| **渐进式披露** | 按需加载上下文 |

---

## 参考资源

- [OpenAI 官方博客：Harness Engineering](https://openai.com/zh-Hans-CN/index/harness-engineering/)
- [小红书：Harness Engineering详解](https://www.xiaohongshu.com/explore/69bbe3c8000000002202a22d)
- [微信公众号：一文讲清楚 Harness Engineering](https://mp.weixin.qq.com/s/TjqHm72KzNI0HNERO00ADA)

---

*整理时间：2026-03-22*
