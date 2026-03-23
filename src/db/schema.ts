import { pgTable, uuid, varchar, timestamp, text, jsonb, decimal, float, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 用户表
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 100 }),
  avatar: varchar('avatar', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 日程表
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  location: varchar('location', { length: 255 }),
  locationLat: float('location_lat'),
  locationLng: float('location_lng'),
  status: varchar('status', { length: 50 }).default('confirmed').notNull(), // confirmed, tentative, cancelled
  isAllDay: boolean('is_all_day').default(false).notNull(),
  recurrence: jsonb('recurrence'), // 用于重复事件
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 费用表
export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  eventId: uuid('event_id').references(() => events.id), // 可选关联
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(), // 餐饮、交通、住宿等
  description: text('description'),
  receiptUrl: varchar('receipt_url', { length: 500 }), // 发票图片URL
  ocrData: jsonb('ocr_data'), // OCR识别结果
  isReimbursed: boolean('is_reimbursed').default(false).notNull(),
  reimbursedAt: timestamp('reimbursed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 会话表（用于对话历史）
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 消息表
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // user, assistant, system
  content: text('content').notNull(),
  toolCalls: jsonb('tool_calls'), // Agent工具调用记录
  toolResults: jsonb('tool_results'), // 工具执行结果
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Agent决策日志（可观测性）
export const agentDecisions = pgTable('agent_decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull(), // 一次对话的ID
  messageId: uuid('message_id').references(() => messages.id),
  agentName: varchar('agent_name', { length: 100 }).notNull(), // orchestrator, schedule_agent, etc.
  stepNumber: integer('step_number').notNull(),
  decisionType: varchar('decision_type', { length: 100 }).notNull(), // classify, plan, execute
  input: jsonb('input_data'),
  output: jsonb('output_data'),
  durationMs: integer('duration_ms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 关系定义
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  expenses: many(expenses),
  conversations: many(conversations),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [expenses.eventId],
    references: [events.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

// 类型导出
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type AgentDecision = typeof agentDecisions.$inferSelect;
export type NewAgentDecision = typeof agentDecisions.$inferInsert;
