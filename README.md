# 自如助手 - 智能日程与费用管理

基于 **智谱AI GLM-5** 和 **Multi-Agent** 架构的智能助手应用。

## 功能特性

- 🗓️ **智能日程管理**
  - 自然语言创建日程
  - 智能时间解析（"下周三下午3点"）
  - 批量操作支持
  - 空闲时间推荐

- 💰 **费用记录**
  - 快速记录支出
  - 智能分类
  - 日程关联

- 🤖 **AI对话交互**
  - 类微信聊天界面
  - 流式响应
  - 工具调用透明展示

## 技术栈

- **前端**: Next.js 15 + React 19 + Tailwind CSS
- **后端**: Next.js API Routes
- **AI**: 智谱AI GLM-5 (via Vercel AI SDK)
- **数据库**: PostgreSQL + Drizzle ORM
- **容器化**: Docker Compose

## 快速开始

### 1. 环境准备

```bash
# 克隆项目
cd ziru-assistant

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env
```

### 2. 配置环境变量

编辑 `.env` 文件：

```env
# 智谱AI API Key (必需)
ZHIPUAI_API_KEY=your_api_key_here

# 数据库连接 (使用Docker时保持默认)
DATABASE_URL=postgresql://postgres:localdev@localhost:5432/ziru_assistant
```

### 3. 启动数据库

```bash
# 启动 PostgreSQL
docker-compose up -d postgres

# 生成数据库迁移
npm run db:generate

# 执行迁移
npm run db:migrate
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
ziru-assistant/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API路由
│   │   │   ├── chat/     # 聊天API
│   │   │   └── events/   # 事件CRUD API
│   │   ├── layout.tsx    # 根布局
│   │   └── page.tsx      # 主页面
│   ├── agents/           # Agent系统
│   │   ├── orchestrator.ts  # 编排器
│   │   └── schedule-agent.ts # 日程Agent
│   ├── db/               # 数据库
│   │   ├── schema.ts     # Drizzle Schema
│   │   └── index.ts      # 数据库连接
│   ├── lib/              # 工具库
│   │   ├── zhipuai-provider.ts # GLM-5提供者
│   │   ├── time-utils.ts # 时间解析
│   │   └── types.ts      # 类型定义
│   └── tools/            # Agent工具
│       └── schedule-tools.ts # 日程工具
├── docker-compose.yml    # Docker配置
├── drizzle.config.ts     # Drizzle配置
└── package.json
```

## 使用示例

### 创建日程
```
用户: 4月18号我要参加AI研讨会，帮我记录一下
助手: 已成功创建日程: AI研讨会
      时间: 2024年4月18日
```

### 查询日程
```
用户: 明天有什么安排？
助手: 明天(3月23日)的日程安排：
      1. 10:00-11:30 产品评审会议 - 会议室A
      2. 14:00-15:00 客户电话会议
```

### 查找空闲时间
```
用户: 下周什么时候适合开会？
助手: 为您推荐以下空闲时间段：
      1. 周一 上午9:00-12:00
      2. 周三 下午2:00-5:00
      3. 周四 全天
```

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 数据库操作
npm run db:generate  # 生成迁移
npm run db:migrate   # 执行迁移
npm run db:studio    # 打开Drizzle Studio

# 代码检查
npm run lint
```

## API文档

### POST /api/chat
聊天接口，支持流式响应

```typescript
// 请求
{
  "messages": [
    { "role": "user", "content": "明天下午3点开会" }
  ]
}

// 响应 (流式)
```

### GET /api/events
获取事件列表

### POST /api/events
创建新事件

### PUT /api/events
更新事件

### DELETE /api/events?id=xxx
删除事件

## 获取API Key

1. 访问 [智谱AI开放平台](https://bigmodel.cn/)
2. 注册/登录账号
3. 进入控制台 -> API Keys
4. 创建新的API Key

## 许可证

MIT
