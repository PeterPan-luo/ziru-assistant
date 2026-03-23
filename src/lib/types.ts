/**
 * Agent类型定义
 */

import { z } from 'zod';

// 意图类型
export const IntentSchema = z.enum([
  'create_event',
  'update_event',
  'delete_event',
  'query_events',
  'find_free_time',
  'record_expense',
  'query_expenses',
  'ocr_receipt',
  'link_expense',
  'generate_report',
  'greeting',
  'help',
  'unknown',
]);

export type Intent = z.infer<typeof IntentSchema>;

// 领域类型
export const DomainSchema = z.enum(['schedule', 'expense', 'cross_domain', 'general']);

export type Domain = z.infer<typeof DomainSchema>;

// 意图分类结果
export const IntentClassificationSchema = z.object({
  intent: IntentSchema,
  domain: DomainSchema,
  confidence: z.number().min(0).max(1),
  entities: z.record(z.string(), z.any()).optional(),
});

export type IntentClassification = z.infer<typeof IntentClassificationSchema>;

// 执行计划
export const ExecutionPlanSchema = z.object({
  id: z.string(),
  description: z.string(),
  steps: z.array(z.object({
    tool: z.string(),
    parameters: z.record(z.string(), z.any()),
    description: z.string(),
  })),
  requiresConfirmation: z.boolean(),
  estimatedTime: z.string().optional(),
});

export type ExecutionPlan = z.infer<typeof ExecutionPlanSchema>;

// 工具执行结果
export const ToolResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export type ToolResult = z.infer<typeof ToolResultSchema>;

// Agent消息
export const AgentMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  toolCalls: z.array(z.object({
    id: z.string(),
    name: z.string(),
    parameters: z.record(z.string(), z.any()),
  })).optional(),
  toolResult: ToolResultSchema.optional(),
});

export type AgentMessage = z.infer<typeof AgentMessageSchema>;

// 会话上下文
export const SessionContextSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  conversationId: z.string().optional(),
  messages: z.array(AgentMessageSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SessionContext = z.infer<typeof SessionContextSchema>;
