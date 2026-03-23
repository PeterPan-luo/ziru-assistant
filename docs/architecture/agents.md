# Agent 体系设计

## 概述

采用 Multi-Agent 架构，每个 Agent 专注于特定领域。

---

## Agent 层级

```
                    ┌─────────────────┐
                    │   Orchestrator  │
                    │   (编排器)       │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
    ┌───────────┐      ┌───────────┐      ┌───────────┐
    │ Schedule  │      │  Expense  │      │  General  │
    │   Agent   │      │   Agent   │      │   Agent   │
    └───────────┘      └───────────┘      └───────────┘
```

---

## Orchestrator Agent

### 职责
- 意图分类
- 路由到正确的领域 Agent
- 跨域协调

### 工具
| 工具 | 描述 |
|------|------|
| classify_intent | 分析用户意图 |
| route | 分发到领域 Agent |

### 决策流程
```
用户输入
    │
    ▼
┌─────────────────┐
│ 意图分类         │
│ - create_event  │
│ - query_events  │
│ - record_expense│
│ - greeting      │
│ - unknown       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 领域路由         │
│ schedule → Schedule Agent
│ expense → Expense Agent
│ cross_domain → 协调执行
└─────────────────┘
```

---

## Schedule Agent

### 职责
- 日程创建、查询、更新、删除
- 时间解析（中文自然语言）
- 空闲时间推荐

### 可用工具
| 工具 | 描述 | 参数 |
|------|------|------|
| createEvent | 创建日程 | title, startTime, endTime, location |
| queryEvents | 查询日程 | startDate, endDate, keywords |
| updateEvent | 更新日程 | eventId, updates |
| deleteEvent | 删除日程 | eventId |
| findFreeTime | 查找空闲 | dateRange, duration |

### 上下文限制
- 最多 5 步工具调用
- 保持在 Smart Zone（上下文利用率 < 40%）

---

## Expense Agent

### 职责
- 费用记录
- OCR 识别
- 日程关联

### 可用工具
| 工具 | 描述 | 参数 |
|------|------|------|
| recordExpense | 记录费用 | amount, category, description |
| ocrReceipt | OCR识别 | imageUrl |
| linkToEvent | 关联日程 | expenseId, eventId |

---

## Agent 通信协议

### 请求格式
```typescript
interface AgentRequest {
  userInput: string;
  conversationHistory: Message[];
  userId: string;
}
```

### 响应格式
```typescript
interface AgentResponse {
  success: boolean;
  response: string;
  toolResults?: ToolResult[];
}
```

---

## 错误处理

### 失败熔断
- 连续失败 3 次：停止执行，请求人工干预
- 记录错误到 agent_decisions 表

### 重试策略
- 网络错误：指数退避重试（1s, 2s, 4s）
- 解析错误：不重试，返回友好错误消息

---

*返回 [架构文档索引](./README.md)*
