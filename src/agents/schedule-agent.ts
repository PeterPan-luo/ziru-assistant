/**
 * Schedule Agent
 * 专门处理日程相关的请求
 */

import { generateText, streamText } from 'ai';
import { z } from 'zod';
import glm5 from '@/lib/zhipuai-provider';
import { scheduleTools } from '@/tools/schedule-tools';
import { IntentClassification } from '@/lib/types';

// Schedule Agent System Prompt
const SCHEDULE_AGENT_SYSTEM_PROMPT = `你是一个专业的日程管理助手。你可以帮助用户创建、查询、更新和删除日程。

## 你的能力：
- 创建日程：理解用户的自然语言描述，解析时间、地点等信息
- 查询日程：根据时间范围、关键词等条件查询
- 更新日程：修改已有日程的各种属性
- 删除日程：取消不需要的日程
- 智能推荐：帮助用户找到合适的空闲时间

## 交互原则：
1. 用简洁友好的语言回复用户
2. 对于复杂的操作，先确认用户意图
3. 提供清晰的操作结果反馈
4. 主动提供相关的建议和提醒

## 时间理解：
你可以理解各种中文时间表达，例如：
- "明天下午3点"
- "下周一上午"
- "4月18号"
- "这周末"

请根据用户的请求，使用合适的工具完成任务。`;

// 处理日程相关请求
export async function handleScheduleRequest(
  userInput: string,
  classification: IntentClassification,
  options?: {
    conversationHistory?: Array<{ role: string; content: string }>;
  }
) {
  console.log('[ScheduleAgent] 处理请求:', userInput);
  console.log('[ScheduleAgent] 意图:', classification.intent);

  try {
    // 使用Vercel AI SDK的工具调用功能
    const { text, toolCalls } = await generateText({
      model: glm5,
      system: SCHEDULE_AGENT_SYSTEM_PROMPT,
      messages: [
        ...(options?.conversationHistory || []),
        { role: 'user', content: userInput },
      ],
      tools: scheduleTools,
      maxSteps: 5, // 最多5步工具调用
    });

    // 处理工具调用结果
    const results = [];
    for (const toolCall of toolCalls || []) {
      results.push({
        tool: toolCall.toolName,
        result: toolCall.result,
      });
    }

    return {
      success: true,
      response: text,
      toolResults: results,
    };
  } catch (error) {
    console.error('[ScheduleAgent] 处理失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '处理请求失败',
      response: '抱歉，处理您的请求时遇到了问题，请稍后再试。',
    };
  }
}

// 流式处理（用于实时响应）
export async function streamScheduleResponse(
  userInput: string,
  options?: {
    conversationHistory?: Array<{ role: string; content: string }>;
  }
) {
  const stream = await streamText({
    model: glm5,
    system: SCHEDULE_AGENT_SYSTEM_PROMPT,
    messages: [
      ...(options?.conversationHistory || []),
      { role: 'user', content: userInput },
    ],
    tools: scheduleTools,
    maxSteps: 5,
  });

  return stream;
}

export default {
  handleScheduleRequest,
  streamScheduleResponse,
};
