# 日历视图设计

## 概述
月历视图，显示用户日程概览。

---

## 布局结构

```
┌─────────────────────────────────────────┐
│  ←    2026年3月    →                    │
├─────────────────────────────────────────┤
│  一    二    三    四    五    六    日  │
├─────────────────────────────────────────┤
│      1     2     3     4     5     6   │
│                                         │
│  [7]    8     9    [10]  11    12   13  │
│  •                 •                    │
│                                         │
│  14    15    16    17   [18]   19   20  │
│                        •                │
├─────────────────────────────────────────┤
│  今日日程                               │
│  ┌─────────────────────────────────┐   │
│  │ 10:00-11:30 产品评审             │   │
│  │ 14:00-15:00 客户电话             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 样式规范

### 日期单元格
```css
.calendar-day {
  min-height: 80px;
  padding: 8px;
  cursor: pointer;
}

.calendar-day-today {
  background: #e0f2fe;  /* primary-100 */
  font-weight: 600;
}

.calendar-day-has-event::after {
  content: '';
  width: 4px;
  height: 4px;
  background: #0ea5e9;  /* primary-500 */
  border-radius: 50%;
}
```

### 事件标签
```css
.event-tag {
  background: #bae6fd;  /* primary-200 */
  color: #0369a1;       /* primary-700 */
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

---

## 交互行为

### 日期点击
- 单击：高亮选中日期，显示该日日程
- 双击：打开创建日程对话框

### 月份切换
- 左箭头：上个月
- 右箭头：下个月
- 支持滑动切换（移动端）

---

## 数据加载

### 查询策略
```typescript
// 获取当前月份事件
const events = await fetch(`/api/events?startDate=${monthStart}&endDate=${monthEnd}`);
```

### 缓存策略
- 当前月份 + 前后各一个月缓存
- 切换月份时预加载

---

*返回 [设计文档索引](./README.md)*
