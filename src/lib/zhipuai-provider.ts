import { createOpenAI } from '@ai-sdk/openai';

// 创建智谱AI provider（使用OpenAI兼容接口）
export const zhipuai = createOpenAI({
  apiKey: process.env.ZHIPUAI_API_KEY,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
});

// GLM-5 模型 - 用于所有Agent任务
export const glm5 = zhipuai('glm-5');

// GLM-4 模型 - 备选方案
export const glm4 = zhipuai('glm-4');

// 默认导出GLM-5
export default glm5;
