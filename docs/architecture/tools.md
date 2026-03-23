# 工具定义

## 概述

工具是 Agent 可调用的函数，遵循 **"Dumb Tools"** 原则：只做简单执行，不负责复杂推理。

---

## 工具设计原则

1. **单一职责**：每个工具只做一件事
2. **幂等性**：相同输入产生相同结果
3. **可观测**：每次调用都记录
4. **错误友好**：返回结构化错误信息

---

## Schedule 工具

### createEvent

**描述**：创建新的日程事件

**参数**：
```typescript
{
  title: string;        // 日程标题
  startTime: string;    // 开始时间（自然语言或 ISO）
  endTime?: string;     // 结束时间（可选）
  location?: string;    // 地点（可选）
  description?: string; // 描述（可选）
  isAllDay?: boolean;   // 是否全天事件
}
```

**返回**：
```typescript
{
  success: boolean;
  data?: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location: string | null;
  };
  error?: string;
  message?: string;
}
```

---

### queryEvents

**描述**：查询日程事件

**参数**：
```typescript
{
  startDate?: string;   // 开始日期
  endDate?: string;     // 结束日期
  keywords?: string;    // 搜索关键词
  status?: 'confirmed' | 'tentative' | 'cancelled';
  limit?: number;       // 结果数量限制
}
```

**返回**：
```typescript
{
  success: boolean;
  data?: Event[];
  count?: number;
  error?: string;
}
```

---

### updateEvent

**描述**：更新日程事件

**参数**：
```typescript
{
  eventId: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
}
```

---

### deleteEvent

**描述**：删除日程事件

**参数**：
```typescript
{
  eventId: string;
}
```

---

### findFreeTime

**描述**：查找空闲时间段

**参数**：
```typescript
{
  dateRange?: string;   // "这周" | "下周"
  duration?: number;    // 需要的时长（分钟）
  preferredTime?: string; // "上午" | "下午"
}
```

**返回**：
```typescript
{
  success: boolean;
  data?: {
    rangeStart: string;
    rangeEnd: string;
    freeSlots: Array<{
      start: string;
      end: string;
    }>;
  };
}
```

---

## 工具调用示例

### 成功调用
```json
{
  "tool": "createEvent",
  "parameters": {
    "title": "产品评审会议",
    "startTime": "下周三下午3点",
    "location": "会议室A"
  },
  "result": {
    "success": true,
    "data": {
      "id": "evt_abc123",
      "title": "产品评审会议",
      "startTime": "2026-03-25T15:00:00Z",
      "endTime": "2026-03-25T16:00:00Z"
    },
    "message": "已成功创建日程: 产品评审会议"
  }
}
```

### 失败调用
```json
{
  "tool": "updateEvent",
  "parameters": {
    "eventId": "nonexistent"
  },
  "result": {
    "success": false,
    "error": "未找到指定的日程"
  }
}
```

---

## 可观测性

每次工具调用都记录到 `agent_decisions` 表：

```sql
INSERT INTO agent_decisions (
  session_id,
  agent_name,
  step_number,
  decision_type,
  input_data,
  output_data
) VALUES (?, ?, ?, 'tool_call', ?, ?);
```

---

*返回 [架构文档索引](./README.md)*
