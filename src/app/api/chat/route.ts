/**
 * Chat API Route
 * 处理用户对话，调用Agent系统
 */

import { streamText } from 'ai';
import glm5 from '@/lib/zhipuai-provider';
import { scheduleTools } from '@/tools/schedule-tools';

// 设置为Edge Runtime以支持流式响应
export const runtime = 'edge';

// 系统提示词
const SYSTEM_PROMPT = `你是自如助手，一个智能日程和费用管理助手。

## 你的能力：
1. **日程管理**
   - 创建日程："4月18号我要参加AI研讨会，帮我记录一下"
   - 查询日程："明天有什么安排？"
   - 修改日程："把下周一的会议改到下午"
   - 删除日程："取消后天的约会"
   - 推荐时间："下周什么时候适合开会？"

2. **费用管理**
   - 记录支出："今天买咖啡花了30块"
   - 查询费用："这个月餐饮花了多少？"

## 交互原则：
- 用简洁友好的中文回复
- 准确理解用户的自然语言表达
- 对于重要操作（删除、修改），先确认
- 提供清晰的操作反馈

## 时间理解：
你可以理解各种中文时间表达：
- "明天下午3点"、"下周三上午"、"4月18号"
- "这周末"、"下周一到周五"

请根据用户的请求，使用合适的工具帮助他们管理日程和费用。`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 使用Vercel AI SDK处理流式响应
    const result = streamText({
      model: glm5,
      system: SYSTEM_PROMPT,
      messages,
      tools: scheduleTools,
      maxSteps: 5,
    });

    // 返回流式响应
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({
        error: '处理请求失败',
        message: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
