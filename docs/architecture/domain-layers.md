# 领域分层说明

## 分层架构

基于 DDD（领域驱动设计）原则，系统按领域组织：

```
src/
├── agents/           # Agent 编排层
│   ├── orchestrator.ts    # 意图分类与路由
│   ├── schedule-agent.ts  # 日程领域 Agent
│   └── expense-agent.ts   # 费用领域 Agent
│
├── tools/            # 工具层（领域操作）
│   └── schedule-tools.ts  # 日程 CRUD 工具
│
├── db/               # 数据访问层
│   ├── schema.ts          # 数据模型
│   └── index.ts           # 数据库连接
│
├── lib/              # 基础设施层
│   ├── zhipuai-provider.ts  # GLM-5 提供者
│   ├── time-utils.ts        # 时间解析
│   └── types.ts             # 类型定义
│
└── app/              # 表现层
    ├── api/                # API 端点
    └── page.tsx            # UI 组件
```

---

## 领域边界

### Schedule Domain（日程域）
**职责**：管理用户日程事件

**实体**：
- Event（日程事件）

**工具**：
- createEvent
- queryEvents
- updateEvent
- deleteEvent
- findFreeTime

### Expense Domain（费用域）
**职责**：管理用户费用记录

**实体**：
- Expense（费用记录）

**工具**：
- recordExpense
- ocrReceipt
- linkToEvent
- generateReport

---

## 通信规则

### 跨域通信
- 所有跨域操作通过 Orchestrator 协调
- Agent 之间不直接调用
- 共享数据通过数据库

### 示例流程
```
用户: "把上海出差的代驾发票关联到报销单"

1. Orchestrator 分类 → cross_domain
2. Orchestrator 调用 Expense Agent
3. Expense Agent 调用 ocrReceipt → 获取发票信息
4. Expense Agent 调用 Schedule Agent（通过 Orchestrator）
5. Schedule Agent 查询匹配的日程
6. Expense Agent 创建报销单
```

---

## 扩展指南

### 添加新领域
1. 在 `src/db/schema.ts` 添加实体
2. 在 `src/tools/` 创建领域工具
3. 在 `src/agents/` 创建领域 Agent
4. 更新 Orchestrator 路由规则

---

*返回 [架构文档索引](./README.md)*
