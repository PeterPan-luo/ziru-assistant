/**
 * Orchestrator Agent
 * 负责意图分类、领域路由和跨Agent协调
 */

import { generateText } from 'ai';
import { z } from 'zod';
import glm5 from '@/lib/zhipuai-provider';
import { IntentClassification, Intent, Domain } from '@/lib/types';

// 意图分类的System Prompt
const CLASSIFIER_SYSTEM_PROMPT = `你是一个智能助手的意图分类器。你的任务是分析用户输入，识别用户的意图和所属领域。

## 可能的意图类型：
- create_event: 创建日程
- update_event: 更新日程
- delete_event: 删除日程
- query_events: 查询日程
- find_free_time: 查找空闲时间
- record_expense: 记录费用
- query_expenses: 查询费用
- ocr_receipt: OCR识别发票
- link_expense: 关联费用到日程
- generate_report: 生成报告
- greeting: 打招呼
- help: 寻求帮助
- unknown: 无法识别

## 可能的领域：
- schedule: 日程相关
- expense: 费用相关
- cross_domain: 跨领域（日程+费用）
- general: 一般对话

请根据用户输入，返回JSON格式的分类结果。`;

// 意图分类函数
export async function classifyIntent(userInput: string): Promise<IntentClassification> {
  try {
    const { text } = await generateText({
      model: glm5,
      system: CLASSIFIER_SYSTEM_PROMPT,
      prompt: `请分析以下用户输入，返回意图分类结果（JSON格式）：

用户输入："${userInput}"

返回格式：
{
  "intent": "意图类型",
  "domain": "领域",
  "confidence": 0.95,
  "entities": {
    // 提取的关键实体
  }
}`,
    });

    // 尝试解析JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        intent: parsed.intent as Intent,
        domain: parsed.domain as Domain,
        confidence: parsed.confidence || 0.8,
        entities: parsed.entities,
      };
    }

    // 默认返回
    return {
      intent: 'unknown',
      domain: 'general',
      confidence: 0.5,
    };
  } catch (error) {
    console.error('意图分类失败:', error);
    return {
      intent: 'unknown',
      domain: 'general',
      confidence: 0,
    };
  }
}

// 生成执行计划
export async function generateExecutionPlan(
  userInput: string,
  classification: IntentClassification
): Promise<{
  plan: string;
  requiresConfirmation: boolean;
}> {
  // 需要确认的操作
  const confirmationRequired = [
    'delete_event',
    'update_event',
    'generate_report',
  ];

  const requiresConfirmation = confirmationRequired.includes(classification.intent);

  // 对于批量操作或删除操作，生成详细计划
  if (requiresConfirmation) {
    const { text: plan } = await generateText({
      model: glm5,
      system: `你是一个执行计划生成器。根据用户意图，生成清晰的执行计划。`,
      prompt: `用户输入："${userInput}"
分类结果：${JSON.stringify(classification)}

请生成一个简洁的执行计划，说明将要执行什么操作。`,
    });

    return { plan, requiresConfirmation };
  }

  return {
    plan: `将执行 ${classification.intent} 操作`,
    requiresConfirmation: false,
  };
}

// Orchestrator主函数
export async function orchestrate(userInput: string, context?: {
  conversationHistory?: Array<{ role: string; content: string }>;
  userId?: string;
}) {
  console.log('[Orchestrator] 开始处理用户输入:', userInput);

  // 1. 意图分类
  const classification = await classifyIntent(userInput);
  console.log('[Orchestrator] 意图分类结果:', classification);

  // 2. 生成执行计划
  const { plan, requiresConfirmation } = await generateExecutionPlan(userInput, classification);

  return {
    classification,
    plan,
    requiresConfirmation,
    nextAgent: getAgentForDomain(classification.domain),
  };
}

// 根据领域获取对应的Agent
function getAgentForDomain(domain: Domain): string {
  switch (domain) {
    case 'schedule':
      return 'schedule_agent';
    case 'expense':
      return 'expense_agent';
    case 'cross_domain':
      return 'coordinator';
    default:
      return 'general_agent';
  }
}

export default {
  classifyIntent,
  generateExecutionPlan,
  orchestrate,
};
