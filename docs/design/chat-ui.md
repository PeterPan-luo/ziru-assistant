# 聊天界面设计

## 概述
类似微信的对话界面，用户通过自然语言与助手交互。

---

## 布局结构

```
┌─────────────────────────────────────┐
│           顶部导航栏                 │
├─────────────────────────────────────┤
│                                     │
│           消息区域                   │
│   ┌─────────────────┐              │
│   │ 助手消息         │              │
│   └─────────────────┘              │
│              ┌─────────────────┐   │
│              │ 用户消息         │   │
│              └─────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ 🔧 工具调用展示              │  │
│   │ createEvent: 成功           │  │
│   └─────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│   [输入框]              [发送按钮]  │
└─────────────────────────────────────┘
```

---

## 组件规范

### 消息气泡
```css
.message-user {
  background: #0ea5e9;  /* primary-500 */
  color: white;
  border-radius: 16px 16px 0 16px;
  margin-left: auto;
}

.message-assistant {
  background: #f3f4f6;  /* gray-100 */
  color: #111827;       /* gray-900 */
  border-radius: 16px 16px 16px 0;
}
```

### 工具调用展示
```css
.tool-call {
  background: #eff6ff;  /* blue-50 */
  border: 1px solid #bfdbfe;  /* blue-200 */
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
  font-size: 14px;
}
```

---

## 状态管理

### 消息列表
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolInvocations?: ToolInvocation[];
  createdAt: Date;
}
```

### 发送流程
1. 用户输入 → 添加用户消息
2. 显示加载指示器
3. 调用 /api/chat（流式响应）
4. 逐步显示助手回复
5. 隐藏加载指示器

---

## 可访问性

- 支持键盘导航（Tab / Enter）
- 屏幕阅读器友好
- 高对比度模式支持

---

*返回 [设计文档索引](./README.md)*
