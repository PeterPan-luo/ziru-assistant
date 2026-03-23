# Ziru Assistant - Claude Code 指令

> 本文件为 Claude Code 提供项目上下文和指令

---

## 项目概述

这是一个智能日程和费用管理助手，基于 GLM-5 和 Multi-Agent 架构。

---

## 开发规范

### 代码风格
- TypeScript 严格模式
- 函数式组件 + Hooks
- Tailwind CSS 样式
- 文件命名：kebab-case

### 架构原则
- **薄客户端**：业务逻辑在后端
- **Smart Agent, Dumb Tools**：工具只做简单执行
- **渐进式披露**：保持上下文精简

---

## 常用命令

```bash
# 开发
npm run dev

# 数据库
npm run db:push
npm run db:studio

# 构建
npm run build
```

---

## 黄金原则

1. 所有业务逻辑在后端
2. 工具只做简单执行
3. 每次工具调用都记录
4. 关键操作需要确认
5. 时间解析优先使用工具

---

## 知识库

- [AGENTS.md](../AGENTS.md) - 项目入口
- [架构文档](../docs/architecture/README.md)
- [设计文档](../docs/design/README.md)
