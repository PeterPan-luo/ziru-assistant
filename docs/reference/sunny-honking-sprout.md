# 智能日程与费用管理助手 - 开发方案

> **技术选型核心**：基于 **智谱AI GLM-5** 构建Multi-Agent系统
>
> **为什么选择GLM-5？**
> - 🎯 **最新旗舰模型**：智谱AI最强推理能力
> - 🇨🇳 **中文理解优秀**：精准理解自然语言日程描述
> - ⚡ **Function Calling完善**：完美支持Agent工具调用
> - 📊 **结构化输出**：支持JSON Schema，便于解析
> - 💰 **性价比高**：相比国际模型成本更低
> - 🔧 **易于集成**：提供OpenAI兼容接口，快速上手

---

## 一、项目背景与目标

### 1.1 核心痛点
- 传统日程管理软件需要**填表式交互**，操作繁琐
- 无法用自然语言批量操作日程（"下周一所有行程清空"）
- 日程管理与费用管理**割裂**，需要在不同应用间切换
- 缺乏**跨业务域协同**能力（如：发票自动关联日程并报销）

### 1.2 产品愿景
> 打造一个像微信对话框一样的智能助手，用户持续输入自然语言需求，系统自动解析、规划、执行，提供结构化结果。

### 1.3 核心价值主张
- **LUI（语言界面）作为交互核心**：用户只需说话，无需填表
- **图形界面只负责数据呈现**：日历、列表、图表等可视化
- **日程与费用一体化管理**：统一入口，智能关联
- **跨领域协同**：OCR识别 → 找到日程 → 关联报销

---

## 二、产品功能规划

### 2.1 日程管理（MVP核心）
| 功能 | 示例对话 |
|------|---------|
| 单次创建 | "4月18号我要去参加AI行业研讨会，帮我记录一下" |
| 批量创建 | "北京车展媒体日参加，提前两天到北京，结束后回深圳" |
| 智能查询 | "明天什么时间有空？我要跟团队开会" |
| 批量修改 | "下周一不想上班，把所有行程清空" |
| 时间推荐 | "帮我找下周最适合开产品评审的时间" |

### 2.2 费用管理
| 功能 | 示例对话 |
|------|---------|
| 记录支出 | "今天给团队买咖啡花了150，帮我记一下" |
| 智能报销 | 上传代驾发票 → 自动关联上海出差日程 → 生成报销单 |
| 费用查询 | "这个月餐饮费用多少？" |

### 2.3 跨业务域协同（高级功能）
- **智能关联**：OCR识别发票 → 向量检索匹配日程 → 自动分类
- **一键报销**：生成符合企业报销流程的单据

### 2.4 可选扩展功能
- 会议纪要自动生成与关联
- 出差行程规划（机票/酒店推荐）
- 智能提醒（基于日程和位置）
- 团队协作（共享日程、费用审批）

---

## 三、技术架构设计

### 3.1 整体架构（Multi-Agent系统）
```
┌─────────────────────────────────────────────────────┐
│                  客户端层（薄客户端）                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ iOS原生   │  │ Android  │  │   Web    │          │
│  │ (聊天+卡片)│  │  (同构)  │  │  (全功能) │          │
│  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────┘
                         ↓ API
┌─────────────────────────────────────────────────────┐
│                后端服务层（Agent编排）                │
│  ┌─────────────────────────────────────────────┐   │
│  │      Orchestrator Agent (编排器)             │   │
│  │  - 意图分类 (Classifier)                     │   │
│  │  - 跨领域协调                                │   │
│  │  - 结果汇总                                  │   │
│  └─────────────────────────────────────────────┘   │
│          ↓                      ↓                  │
│  ┌──────────────┐      ┌──────────────┐           │
│  │Schedule Agent│      │Expense Agent │           │
│  │  - 日程解析  │      │  - 费用记录  │           │
│  │  - 时间推理  │      │  - OCR识别   │           │
│  │  - 冲突检测  │      │  - 智能关联  │           │
│  └──────────────┘      └──────────────┘           │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              基础设施层（共享服务）                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ 数据库   │  │ 向量存储 │  │ 可观测性 │            │
│  │(PostgreSQL)│ │(pgvector)│ │(日志+追踪)│            │
│  └─────────┘  └─────────┘  └─────────┘            │
└─────────────────────────────────────────────────────┘
```

### 3.2 核心设计原则

#### 薄客户端原则
- **前端只负责**：UI渲染、用户输入收集、结果展示
- **所有业务逻辑在后端**：Agent循环、工具调用、数据操作
- **好处**：多端同构、业务逻辑统一、易于维护

#### DDD领域驱动设计
- **日程域**：完全独立的Schedule Agent
- **费用域**：完全独立的Expense Agent
- **编排层**：Orchestrator负责跨域协调
- **好处**：高内聚低耦合、可独立部署、业务语义清晰

#### Smart Agent, Dumb Tools
- **Agent掌握上下文**：充分推理、智能决策
- **工具极简**：只做最简单的执行（CRUD）
- **好处**：bug易定位、易测试、易重构

---

## 四、Agent架构设计

### 4.1 计划与执行流水线（推荐方案）
```
用户输入 → 意图分类 → 生成执行计划 → 用户确认 → 批量执行 → 结果反馈
```

**优势**：
- 批量操作一次推理完成（不是多轮ReAct）
- 效率高：5个日程创建从2分钟缩短到30秒
- 可解释性强：用户可以看到计划再确认

### 4.2 Orchestrator Agent职责
```python
# 伪代码示例
class OrchestratorAgent:
    def process(self, user_input):
        # 1. 意图分类
        intent = classify_intent(user_input)

        # 2. 路由到对应领域Agent
        if intent.domain == "schedule":
            plan = schedule_agent.plan(user_input)
        elif intent.domain == "expense":
            plan = expense_agent.plan(user_input)
        elif intent.domain == "cross_domain":
            # 跨域协调
            plan = self.coordinate(user_input)

        # 3. 用户确认
        if plan.requires_confirmation:
            return self.ask_confirmation(plan)

        # 4. 执行
        result = self.execute_plan(plan)
        return result
```

### 4.3 Schedule Agent核心工具
| 工具 | 功能 | 示例 |
|------|------|------|
| `create_event` | 创建日程 | {title, start_time, end_time, location} |
| `update_event` | 更新日程 | {event_id, updates} |
| `delete_event` | 删除日程 | {event_id} |
| `query_events` | 查询日程 | {time_range, keywords} |
| `find_free_time` | 查找空闲时间 | {duration, time_range} |

### 4.4 Expense Agent核心工具
| 工具 | 功能 |
|------|------|
| `record_expense` | 记录费用 |
| `ocr_receipt` | OCR识别发票 |
| `link_to_event` | 关联到日程 |
| `generate_report` | 生成报销单 |

---

## 五、技术选型

### 5.1 核心技术栈

| 领域 | 选择 | 理由 |
|------|------|------|
| **Agent框架** | Vercel AI SDK | 开箱即用，处理工具循环、上下文管理、流式输出 |
| **大模型** | 智谱AI GLM-5 | 最新旗舰模型，推理能力强，支持function calling，中文理解优秀 |
| **后端框架** | Next.js / Node.js | 与Vercel SDK深度集成，全栈开发 |
| **数据库** | PostgreSQL + pgvector | 关系数据+向量检索一体化 |
| **前端** | React Native (Expo) | 跨平台，一套代码多端运行 |
| **容器化** | Docker Compose | 简单易用，加快研发节奏 |

### 5.2 API服务选型

| 服务 | 用途 | 选择 |
|------|------|------|
| 地理位置服务 | 地址补全、精准搜索 | 高德地图API |
| 向量Embedding | 日程向量化 | 智谱AI Embedding-2 |
| 重排序 | 相似度评分接近时的最终评判 | Jina Reranker |
| OCR | 发票识别 | 百度OCR / 腾讯OCR |

### 5.3 智谱AI模型选择策略

#### GLM-5 模型特点

| 特性 | 说明 |
|------|------|
| **模型名称** | GLM-5（智谱AI最新旗舰） |
| **核心优势** | 最强推理能力、优秀的中文理解、支持复杂任务规划 |
| **Function Calling** | 完整支持，适合Agent工具调用 |
| **上下文窗口** | 超长上下文，支持复杂对话历史 |
| **推荐场景** | Agent编排、复杂推理、多步骤任务规划 |

#### 为什么选择 GLM-5？

1. **推理能力强**：适合Multi-Agent系统的复杂协调任务
2. **中文理解优秀**：准确理解自然语言日程描述
3. **Function Calling完善**：与Agent工具调用深度集成
4. **结构化输出**：支持JSON Schema，便于解析Agent决策
5. **成本合理**：相比国际模型，性价比更高

#### 模型使用策略

```javascript
// 所有Agent统一使用 GLM-5
const model = 'glm-5';

// 优势：
// 1. 意图分类准确率高
// 2. 时间推理准确（"下周三下午3点"这类表达）
// 3. 批量操作规划能力强
// 4. 跨域协调能力出色
// 5. 中文语义理解精准

// 成本估算示例
// 假设每天100次对话，平均每次500 tokens
// 月成本约：100 * 30 * 500 * 单价
// 相比GLM-4，GLM-5在复杂任务上表现更稳定，减少重试次数
```

#### 向量嵌入模型

| 模型 | 用途 | 维度 | 价格 |
|------|------|------|------|
| **Embedding-2** | 日程向量化、语义搜索 | 4096 | ¥0.5/1M tokens |

**使用场景**：
- 日程创建后自动向量化
- 语义搜索匹配日程（如"找上周关于产品讨论的会"）
- 发票与日程的智能关联

### 5.4 可观测性工具
- **日志**：Winston / Pino
- **追踪**：OpenTelemetry
- **监控**：Prometheus + Grafana
- **决策ID追踪**：每个Agent步骤都有唯一ID，便于debug

---

## 六、数据库设计

### 6.1 核心表结构

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(100),
  created_at TIMESTAMP
);

-- 日程表
CREATE TABLE events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  location VARCHAR(255),
  location_lat FLOAT,
  location_lng FLOAT,
  status VARCHAR(50), -- confirmed, tentative, cancelled
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  -- 向量字段（用于语义搜索）
  embedding vector(1536)
);

-- 费用表
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_id UUID REFERENCES events(id), -- 可选关联
  amount DECIMAL(10, 2),
  category VARCHAR(100), -- 餐饮、交通、住宿等
  description TEXT,
  receipt_url VARCHAR(500), -- 发票图片URL
  ocr_data JSONB, -- OCR识别结果
  created_at TIMESTAMP
);

-- Agent决策日志（可观测性）
CREATE TABLE agent_decisions (
  id UUID PRIMARY KEY,
  session_id UUID, -- 一次对话的ID
  agent_name VARCHAR(100), -- orchestrator, schedule_agent, etc.
  step_number INT,
  decision_type VARCHAR(100), -- classify, plan, execute
  input_data JSONB,
  output_data JSONB,
  created_at TIMESTAMP
);
```

### 6.2 向量索引
```sql
-- 为日程创建向量索引（加速语义搜索）
CREATE INDEX ON events USING ivfflat (embedding vector_cosine_ops);
```

---

## 七、开发路线图

### Phase 1: MVP核心功能（4-6周）
**目标**：可用的日程管理助手

| 周次 | 任务 | 交付物 |
|------|------|--------|
| W1-2 | 后端架构搭建 | Agent框架、数据库、基础API |
| W3-4 | Schedule Agent | 意图解析、时间推理、基础CRUD |
| W5-6 | 前端MVP | 聊天界面、日历视图、基础交互 |

**功能清单**：
- ✅ 单次/批量创建日程
- ✅ 查询日程
- ✅ 修改/删除日程
- ✅ 自然语言时间解析（"下周三下午3点"）
- ✅ 地点搜索（高德API）

### Phase 2: 费用管理（3-4周）
**目标**：费用记录与智能关联

| 周次 | 任务 | 交付物 |
|------|------|--------|
| W7-8 | Expense Agent | 费用记录、OCR识别 |
| W9-10 | 跨域协同 | 发票→日程关联、智能报销 |

**功能清单**：
- ✅ 记录费用
- ✅ OCR识别发票
- ✅ 向量检索匹配日程
- ✅ 生成报销单

### Phase 3: 用户体验优化（2-3周）
**目标**：生产级用户体验

| 周次 | 任务 |
|------|------|
| W11-12 | 混合渲染优化、性能优化、UI打磨 |
| W13 | 可观测性系统、自动化测试 |

### Phase 4: 企业级功能（4-6周，可选）
**目标**：多租户、团队协作

- 多租户架构
- 团队共享日程
- 费用审批流程
- 权限管理

---

## 八、工程品质保障

### 8.1 可观测性系统
```python
# 决策追踪示例
@track_decision
def create_event_tool(event_data):
    decision_id = generate_decision_id()
    log_decision(
        decision_id=decision_id,
        agent="schedule_agent",
        step="execute",
        input=event_data,
        output=result
    )
    return result
```

**好处**：
- 快速定位bug（像击鼓传花，第三个步骤出问题就查第三个）
- 生产环境问题复现
- 性能分析

### 8.2 自动化测试策略

#### 单元测试
- Agent意图分类测试
- 时间解析测试
- 工具执行测试

#### 集成测试
- 端到端对话流程
- 跨域协同测试
- OCR→关联→报销流程

#### 回归测试
```python
# 从生产环境错误自动生成测试用例
def generate_test_case_from_error(log_entry):
    return {
        "input": log_entry.user_input,
        "expected_intent": log_entry.expected,
        "actual_intent": log_entry.actual,
        "should_fail": True
    }
```

### 8.3 自改进飞轮
```
生产错误 → 日志分析 → 自动生成测试 → 本地复现 → 修复 → 加入回归套件
```

---

## 九、关键风险与应对

### 9.1 大模型幻觉风险
**应对**：
- 结构化输出验证（Zod schema）
- 关键操作需要用户确认
- 数据库约束保护

### 9.2 性能风险
**应对**：
- 批量操作一次推理完成
- 向量检索替代全表扫描
- 缓存常见查询

### 9.3 数据安全风险
**应对**：
- 敏感数据加密存储
- API密钥安全管理
- 用户数据隔离（多租户）

### 9.4 成本控制
**应对**：
- 使用GLM-5统一处理（减少模型切换复杂度）
- 实现智能缓存（常见意图、查询结果）
- 批量操作一次性推理（避免多轮调用）
- 设置API调用监控和限额
- 向量检索优先（减少LLM调用次数）

---

## 十、成功指标

### 10.1 产品指标
- 日程创建成功率 > 95%
- 用户满意度 > 4.5/5
- 平均对话轮次 < 3轮完成任务

### 10.2 技术指标
- API响应时间 < 500ms（不含LLM）
- Agent决策时间 < 5s（单个）
- 系统可用性 > 99.5%

### 10.3 开发效率
- 相比传统开发提升 3-5倍效率
- 测试覆盖率 > 80%
- 生产环境问题定位时间 < 10分钟

---

## 十一、个性化实施建议（基于您的需求）

### 11.1 开发背景
- **团队规模**：个人开发者
- **技术背景**：有一定后端/AI开发经验
- **目标平台**：跨平台应用（React Native/Flutter）
- **功能范围**：日程管理 + 基础费用记录
- **部署方式**：本地开发优先

### 11.2 推荐技术栈（简化版）

| 层次 | 推荐方案 | 理由 |
|------|---------|------|
| **Agent框架** | Vercel AI SDK + Next.js | 全栈开发，个人开发者友好 |
| **大模型** | 智谱AI GLM-5 | 最新旗舰模型，推理能力强，支持function calling |
| **数据库** | SQLite → PostgreSQL | 本地先用SQLite，后续迁移 |
| **跨平台前端** | Expo (React Native) | 一套代码iOS+Android |
| **本地部署** | Docker Compose | 一键启动所有服务 |

### 11.3 调整后的开发路线（个人开发者友好版）

#### Week 1-2：环境搭建 + 技术验证
**目标**：跑通最小可行原型

- [ ] Day 1-3：开发环境准备
  - 安装 Node.js 18+、Docker Desktop、VSCode
  - 申请 智谱AI API Key（https://bigmodel.cn/）
  - 初始化项目：`npx create-next-app@latest`
  - 安装核心依赖：
    ```bash
    npm install ai @ai-sdk/openai
    npm install drizzle-orm better-sqlite3
    npm install -D @types/better-sqlite3
    ```
  - 创建GLM-5测试脚本：
    ```javascript
    // test-glm5.js
    import { createOpenAI } from '@ai-sdk/openai';
    import { generateText } from 'ai';

    const zhipuai = createOpenAI({
      apiKey: process.env.ZHIPUAI_API_KEY,
      baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
    });

    // 测试基本对话
    const { text } = await generateText({
      model: zhipuai('glm-5'),
      prompt: '请解析这个日程：下周三下午3点产品评审，会议室A',
    });

    console.log(text);
    ```

- [ ] Day 4-7：Agent框架PoC（GLM-5集成）
  - 测试 GLM-5 API调用
  - 实现第一个简单Agent：意图分类器
  - 验证Function Calling能力
  - 验证结构化输出（JSON Schema）
  - **交付物**：能识别"创建日程"/"查询日程"意图的原型
  - **验证点**：GLM-5能否准确理解"下周三下午3点"这类时间表达

- [ ] Day 8-14：端到端验证
  - 数据库设计与初始化
  - 实现第一个工具：`create_event`
  - 简单的命令行界面测试
  - **交付物**：完整链路（用户输入 → Agent → 工具 → 数据库）

#### Week 3-4：Schedule Agent核心功能
**目标**：日程管理基本可用

- [ ] Agent核心能力
  - 时间解析（"下周三下午3点"）
  - 地点搜索（集成高德API）
  - 批量操作（"下周所有周一的会都改到周二"）

- [ ] 核心工具实现
  - `create_event`、`query_events`、`update_event`、`delete_event`
  - `find_free_time`（智能推荐时间）

- [ ] 测试用例
  - 至少20个对话场景测试
  - 覆盖单次/批量操作

#### Week 5-6：Expo移动端开发
**目标**：可用的移动端界面

- [ ] 基础界面
  - 聊天界面（类似微信）
  - 日历视图（可先用简单的列表）
  - 日程卡片展示

- [ ] 与后端集成
  - WebSocket实时通信
  - 流式输出（用户看到Agent思考过程）

#### Week 7-8：Expense Agent基础功能
**目标**：费用记录可用

- [ ] 基础费用记录
  - 记录支出（"今天买咖啡花了30"）
  - 查询费用（"这个月餐饮花了多少"）

- [ ] 简单的日程关联
  - 手动关联（"这笔费用关联到上海出差"）
  - 自动建议（基于时间和地点）

#### Week 9-10：优化与测试
**目标**：达到可发布质量

- [ ] 用户体验优化
  - 错误处理与友好提示
  - 加载状态与进度反馈
  - 离线模式（本地缓存）

- [ ] 性能优化
  - 响应时间优化
  - API调用次数优化

- [ ] 测试与修复
  - 端到端测试
  - Bug修复

### 11.4 成本控制策略（个人开发者）

#### 大模型API成本优化
```javascript
// 使用 GLM-5 统一处理所有任务
const model = 'glm-5';

// 成本优化策略：
// 1. 缓存常见意图分类结果
// 2. 简单查询使用规则引擎预处理
// 3. 批量操作一次性推理（不是多次ReAct）
// 4. 向量检索优先，减少LLM调用

// 成本估算（GLM-5）
// 假设每天100次对话，平均每次500 tokens
// 优化后可降低30-50%的token消耗

// 监控建议：
// - 追踪每次对话的token消耗
// - 设置每日/每月API调用限额
// - 异常消耗时自动告警
```

#### 本地开发环境
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ai_assistant
      POSTGRES_PASSWORD: localdev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:localdev@postgres:5432/ai_assistant
      ZHIPUAI_API_KEY: ${ZHIPUAI_API_KEY}
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### 11.5 关键技术决策点

#### Q1: 使用Drizzle ORM还是Prisma？
**推荐：Drizzle ORM**
- 更轻量，性能更好
- TypeScript友好
- SQL-like API，易于理解

#### Q2: 状态管理用什么？
**推荐：Zustand + React Query**
- Zustand：简单轻量的客户端状态
- React Query：服务端状态管理

#### Q3: 是否需要向量检索？
**MVP阶段：不需要**
- 先用SQL LIKE + 关键词搜索
- 后期优化时再引入pgvector

#### Q4: 是否需要可观测性系统？
**个人开发：简化版即可**
```javascript
// 简单的决策日志
const logDecision = (agent, step, input, output) => {
  console.log({
    timestamp: new Date().toISOString(),
    agent,
    step,
    input,
    output
  });
};
```

#### Q5: 如何集成智谱AI GLM-5到Vercel AI SDK？
**方案一：使用OpenAI兼容接口**
```javascript
// lib/zhipuai-provider.ts
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

// 创建智谱AI provider（OpenAI兼容）
const zhipuai = createOpenAI({
  apiKey: process.env.ZHIPUAI_API_KEY,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
});

// 使用 GLM-5
export const glm5 = zhipuai('glm-5');

// 使用示例
const { text } = await generateText({
  model: glm5,
  prompt: '帮我分析这个日程：下周三下午3点产品评审',
});
```

**方案二：使用Function Calling**
```javascript
import { generateText, tool } from 'ai';
import { z } from 'zod';

// 定义工具
const createEventTool = tool({
  description: '创建日程事件',
  parameters: z.object({
    title: z.string().describe('日程标题'),
    startTime: z.string().describe('开始时间'),
    endTime: z.string().describe('结束时间'),
    location: z.string().optional().describe('地点'),
  }),
  execute: async ({ title, startTime, endTime, location }) => {
    // 执行创建逻辑
    return { success: true, eventId: 'xxx' };
  },
});

// Agent调用
const { toolCalls } = await generateText({
  model: glm5,
  tools: {
    createEvent: createEventTool,
  },
  prompt: '下周三下午3点开产品评审，会议室A',
});
```

**方案三：原生API调用（如果需要更多控制）**
```javascript
// lib/zhipuai-native.ts
export async function callGLM5(prompt: string, tools?: any[]) {
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ZHIPUAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'glm-5',
      messages: [{ role: 'user', content: prompt }],
      tools: tools,
      stream: false,
    }),
  });

  const data = await response.json();
  return data;
}
```

### 11.6 风险与应对（个人开发者特有）

#### 风险1：时间不够
**应对**：
- 严格MVP范围控制
- 能用现成方案就不自己造轮子
- UI可以用现成组件库（如Tamagui）

#### 风险2：卡在某个技术难点
**应对**：
- 充分利用Claude Code等AI工具
- 加入相关技术社区（Discord/Telegram）
- 先实现简化版本，后续迭代优化

#### 风险3：API成本超预算
**应对**：
- 实现请求缓存
- 本地测试用mock数据
- 设置API调用限额

### 11.7 GLM-5使用注意事项

#### API调用限制
- 每分钟请求次数（RPM）：根据套餐不同
- 并发请求数：建议控制在5个以内
- Token限制：注意单次请求的token数

#### 最佳实践
```javascript
// ✅ 推荐：明确的指令和示例
const prompt = `
你是一个日程管理助手。请解析以下用户输入，提取关键信息：

用户输入："下周三下午3点产品评审，会议室A"

请返回JSON格式：
{
  "title": "日程标题",
  "date": "具体日期（YYYY-MM-DD）",
  "time": "时间（HH:MM）",
  "location": "地点"
}
`;

// ❌ 不推荐：模糊的指令
const badPrompt = '帮我处理这个日程';
```

#### 错误处理
```javascript
try {
  const { text } = await generateText({
    model: glm5,
    prompt: userInput,
  });
} catch (error) {
  // 常见错误类型
  if (error.code === 'rate_limit_exceeded') {
    // 处理限流：等待或降级
  } else if (error.code === 'context_length_exceeded') {
    // 处理超长：截断或分段
  } else {
    // 其他错误：重试或记录
  }
}
```

#### 性能优化建议
1. **批量处理**：多个日程创建合并为一次请求
2. **缓存结果**：相似意图分类结果缓存
3. **异步处理**：复杂任务放入队列
4. **降级策略**：GLM-5不可用时降级到规则引擎

---

### 11.8 学习资源（快速上手）

#### 必读文档（按优先级）
1. [Vercel AI SDK官方教程](https://sdk.vercel.ai/docs/getting-started) - 2小时
2. [智谱AI API文档](https://bigmodel.cn/dev/api) - 1小时
3. [GLM-5模型介绍](https://bigmodel.cn/dev/api/normal-model/glm-5) - 30分钟
4. [Expo快速开始](https://docs.expo.dev/tutorial/introduction/) - 3小时
5. [Drizzle ORM教程](https://orm.drizzle.team/docs/overview) - 1小时

#### 推荐项目参考
- [AI Chatbot模板](https://github.com/vercel/ai-chatbot) - Vercel官方
- [Expo模板](https://github.com/expo/expo/tree/main/templates) - Expo官方

---

## 十二、下一步行动（更新版）

### 本周末可完成
- [ ] 完成开发环境搭建
- [ ] 申请智谱AI API Key并测试调用
- [ ] 验证GLM-5的Function Calling能力
- [ ] 跑通第一个Agent PoC（意图分类）
- [ ] 数据库Schema设计与初始化
- [ ] 实现智谱AI GLM-5与Vercel AI SDK的集成

### 下周目标
- [ ] 实现Schedule Agent基础功能
- [ ] 命令行界面可用
- [ ] 5个核心测试用例通过
- [ ] 验证GLM-5在时间推理和批量操作上的表现
- [ ] 测试GLM-5的中文语义理解准确性

### 两周目标
- [ ] Expo移动端基础界面
- [ ] 端到端验证（用户对话 → 日程创建 → 显示在日历）
- [ ] 准备第一个内测版本

### 一个月目标
- [ ] 日程管理功能完整可用
- [ ] 基础费用记录功能
- [ ] 邀请3-5位朋友内测

---

## 附录A：技术资源

### 官方文档
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [智谱AI API文档](https://bigmodel.cn/dev/api)
- [智谱AI GLM-4模型介绍](https://bigmodel.cn/dev/api/normal-model/glm-4)
- [高德地图API](https://lbs.amap.com/api/)

### 开源参考
- [LangChain](https://github.com/langchain-ai/langchain) - Agent框架备选
- [pgvector](https://github.com/pgvector/pgvector) - 向量数据库扩展
- [智谱AI SDK](https://github.com/zhipuai/zhipuai-sdk-nodejs-v4) - 智谱AI官方Node.js SDK

### 智谱AI资源
- [智谱AI开放平台](https://bigmodel.cn/) - 官方控制台，申请API Key
- [智谱AI API文档](https://bigmodel.cn/dev/api) - 完整API参考
- [GLM-5模型文档](https://bigmodel.cn/dev/api/normal-model/glm-5) - GLM-5能力详解
- [Function Calling文档](https://bigmodel.cn/dev/api#function-calling) - 工具调用指南
- [智谱AI开发者社区](https://bigmodel.cn/dev) - 技术支持与案例分享
- [GLM-5最佳实践](https://bigmodel.cn/dev/guidelines) - 使用技巧与优化建议

### 设计工具
- [Penpot](https://penpot.app/) - 开源设计工具
- [Mobbin](https://mobbin.com/) - 移动端设计参考

---

## 附录B：成本估算

### 开发成本
- **人力**：1-2名全栈开发者（48天开发周期）
- **工具**：智谱AI API（约¥100-300/月）、地图API（免费额度足够）

### 运营成本（月度）
- **云服务器**：¥200-500（Docker Compose部署）
- **数据库**：¥100-300（PostgreSQL托管）
- **大模型API**：¥100-500（取决于用户量）
- **其他API**：¥50-100（OCR、地图）

---

**总结**：

这是一个基于 **智谱AI GLM-5** 和 Multi-Agent 架构的智能助手应用开发方案。

### 核心技术亮点

1. **GLM-5作为核心引擎**
   - 强大的中文理解能力，精准解析自然语言日程
   - 完善的Function Calling支持，完美适配Agent工具调用
   - 结构化输出能力，便于解析Agent决策
   - 性价比高，适合个人开发者

2. **Multi-Agent架构**
   - Orchestrator Agent：跨领域协调
   - Schedule Agent：日程管理专家
   - Expense Agent：费用管理专家
   - "计划与执行流水线"架构，效率远超ReAct循环

3. **工程化实践**
   - 薄客户端 + DDD领域驱动设计
   - Smart Agent, Dumb Tools原则
   - 可观测性系统（决策追踪）
   - 自动化测试 + 自改进飞轮

### 预期成果

通过 **10-12周** 的开发周期，个人开发者可以实现：
- ✅ 可用的智能日程管理助手
- ✅ 基础费用记录与关联功能
- ✅ 跨平台移动应用（iOS + Android）
- ✅ 生产级代码质量（80%+测试覆盖）
- ✅ 相比传统开发 **3-5倍效率提升**

### 立即开始

第一步：访问 [智谱AI开放平台](https://bigmodel.cn/) 申请API Key，开始GLM-5的技术验证！
