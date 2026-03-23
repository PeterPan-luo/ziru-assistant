# 自如助手 - Agent 指南

> 本文档是项目的入口文件，为 AI Agent 提供工作地图。保持简洁（约 100 行），详细内容通过索引链接。

---

## 快速开始

```bash
# 1. 环境配置
cp .env.example .env
# 编辑 .env，添加 ZHIPUAI_API_KEY

# 2. 启动数据库
docker-compose up -d postgres

# 3. 推送数据库 Schema
npm run db:push

# 4. 启动开发服务器
npm run dev
```

---

## 项目结构

```
ziru-assistant/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API 路由
│   │   └── page.tsx      # 主界面
│   ├── agents/           # Agent 系统
│   ├── db/               # 数据库层
│   ├── lib/              # 工具库
│   └── tools/            # Agent 工具
├── docs/                 # 结构化知识库
├── .claude/              # Claude Code 配置
└── scripts/              # 工具脚本
```

---

## 核心概念

### 架构模式
- **Multi-Agent 架构**：Orchestrator + 领域 Agent
- **DDD 领域驱动**：Schedule Domain / Expense Domain
- **薄客户端原则**：业务逻辑在后端，前端只负责展示

### 关键抽象
- **Agent**：具有特定能力的智能体
- **Tool**：Agent 可调用的函数
- **Session**：用户对话会话
- **Decision**：Agent 决策日志（可观测性）

### 设计原则
- **Smart Agent, Dumb Tools**：Agent 掌握上下文，工具只做简单执行
- **渐进式披露**：按需加载上下文，保持在 Smart Zone
- **状态持久化**：关键操作必须记录状态

---

## Agent 体系

| Agent | 职责 | 可用工具 |
|-------|------|----------|
| **Orchestrator** | 意图分类、路由协调 | classify_intent, route |
| **Schedule Agent** | 日程管理 | createEvent, queryEvents, updateEvent, deleteEvent, findFreeTime |
| **Expense Agent** | 费用管理 | recordExpense, ocrReceipt, linkToEvent |

---

## 开发规范

### 代码风格
- TypeScript 严格模式
- 函数式组件 + Hooks
- Tailwind CSS 样式

### 命名约定
- 文件：kebab-case（schedule-agent.ts）
- 组件：PascalCase（EventCard.tsx）
- 函数：camelCase（parseChineseTime）

### 测试要求
- Agent 工具必须有单元测试
- API 端点必须有集成测试
- 覆盖率目标 > 80%

---

## 黄金原则

1. **所有业务逻辑在后端**：前端只负责 UI 渲染
2. **工具只做简单执行**：复杂推理由 Agent 完成
3. **每次工具调用都记录**：便于调试和可观测性
4. **关键操作需要确认**：删除、批量修改前必须确认
5. **时间解析优先使用工具**：不依赖 LLM 推理时间

---

## 知识库索引

- [设计文档](./docs/design/README.md) - 功能设计和 UI 规范
- [架构文档](./docs/architecture/README.md) - 系统架构和依赖关系
- [执行计划](./docs/plans/README.md) - Sprint 计划和进度
- [技术债务](./docs/tech-debt/README.md) - 待优化项

---

## 常见任务

### 添加新的 Agent 工具
1. 在 `src/tools/` 创建工具定义
2. 在 `src/agents/` 引入工具
3. 更新 `docs/architecture/tools.md`

### 修改数据库 Schema
1. 编辑 `src/db/schema.ts`
2. 运行 `npm run db:generate`
3. 运行 `npm run db:push`

### 调试 Agent 决策
1. 查看 `agent_decisions` 表
2. 使用 decision_id 追踪完整调用链

---

*最后更新：2026-03-23*
