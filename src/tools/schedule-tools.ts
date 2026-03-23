/**
 * Schedule Agent 工具定义
 */

import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/db';
import { events } from '@/db/schema';
import { eq, and, gte, lte, or, like, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { parseChineseTime, hasTimeConflict, getThisWeek, getNextWeek } from '@/lib/time-utils';

// 创建日程工具
export const createEventTool = tool({
  description: '创建新的日程事件。用于用户想要添加、创建、安排新的日程时。',
  parameters: z.object({
    title: z.string().describe('日程标题'),
    startTime: z.string().describe('开始时间，ISO格式或自然语言描述'),
    endTime: z.string().optional().describe('结束时间，ISO格式或自然语言描述，可选'),
    location: z.string().optional().describe('地点'),
    description: z.string().optional().describe('日程描述'),
    isAllDay: z.boolean().optional().describe('是否为全天事件'),
  }),
  execute: async ({ title, startTime, endTime, location, description, isAllDay }) => {
    try {
      // 解析时间
      const parsedTime = parseChineseTime(startTime);
      if (!parsedTime) {
        return {
          success: false,
          error: `无法解析时间: ${startTime}`,
        };
      }

      const eventStart = parsedTime.startTime;
      let eventEnd = parsedTime.endTime;

      // 如果提供了结束时间，解析它
      if (endTime) {
        const parsedEndTime = parseChineseTime(endTime);
        if (parsedEndTime) {
          eventEnd = parsedEndTime.endTime;
        }
      }

      // 临时用户ID（实际应用中应从会话获取）
      const tempUserId = 'temp-user-001';

      // 创建事件
      const [newEvent] = await db.insert(events).values({
        id: nanoid(),
        userId: tempUserId,
        title,
        description: description || null,
        startTime: eventStart,
        endTime: eventEnd,
        location: location || null,
        isAllDay: isAllDay || parsedTime.isAllDay,
        status: 'confirmed',
      }).returning();

      return {
        success: true,
        data: {
          id: newEvent.id,
          title: newEvent.title,
          startTime: newEvent.startTime.toISOString(),
          endTime: newEvent.endTime.toISOString(),
          location: newEvent.location,
        },
        message: `已成功创建日程: ${title}`,
      };
    } catch (error) {
      console.error('创建日程失败:', error);
      return {
        success: false,
        error: `创建日程失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  },
});

// 查询日程工具
export const queryEventsTool = tool({
  description: '查询用户的日程事件。可以根据时间范围、关键词等条件查询。',
  parameters: z.object({
    startDate: z.string().optional().describe('查询开始日期，ISO格式或自然语言'),
    endDate: z.string().optional().describe('查询结束日期，ISO格式或自然语言'),
    keywords: z.string().optional().describe('搜索关键词'),
    status: z.enum(['confirmed', 'tentative', 'cancelled']).optional().describe('日程状态'),
    limit: z.number().optional().describe('返回结果数量限制'),
  }),
  execute: async ({ startDate, endDate, keywords, status, limit = 20 }) => {
    try {
      // 临时用户ID
      const tempUserId = 'temp-user-001';

      // 构建查询条件
      const conditions = [eq(events.userId, tempUserId)];

      // 时间范围
      if (startDate) {
        const parsedStart = parseChineseTime(startDate);
        if (parsedStart) {
          conditions.push(gte(events.startTime, parsedStart.startTime));
        }
      }

      if (endDate) {
        const parsedEnd = parseChineseTime(endDate);
        if (parsedEnd) {
          conditions.push(lte(events.endTime, parsedEnd.endTime));
        }
      }

      // 状态过滤
      if (status) {
        conditions.push(eq(events.status, status));
      }

      // 执行查询
      let query = db.select().from(events).where(and(...conditions));

      // 关键词搜索
      if (keywords) {
        query = db.select().from(events).where(
          and(
            ...conditions,
            or(
              like(events.title, `%${keywords}%`),
              like(events.description, `%${keywords}%`),
              like(events.location, `%${keywords}%`)
            )
          )
        );
      }

      const results = await query.orderBy(desc(events.startTime)).limit(limit);

      return {
        success: true,
        data: results.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          startTime: event.startTime.toISOString(),
          endTime: event.endTime.toISOString(),
          location: event.location,
          status: event.status,
        })),
        count: results.length,
      };
    } catch (error) {
      console.error('查询日程失败:', error);
      return {
        success: false,
        error: `查询日程失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  },
});

// 更新日程工具
export const updateEventTool = tool({
  description: '更新现有的日程事件。需要提供事件ID和要更新的字段。',
  parameters: z.object({
    eventId: z.string().describe('要更新的日程ID'),
    title: z.string().optional().describe('新的日程标题'),
    startTime: z.string().optional().describe('新的开始时间'),
    endTime: z.string().optional().describe('新的结束时间'),
    location: z.string().optional().describe('新的地点'),
    description: z.string().optional().describe('新的描述'),
    status: z.enum(['confirmed', 'tentative', 'cancelled']).optional().describe('新的状态'),
  }),
  execute: async ({ eventId, title, startTime, endTime, location, description, status }) => {
    try {
      // 构建更新对象
      const updates: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (title) updates.title = title;
      if (location !== undefined) updates.location = location;
      if (description !== undefined) updates.description = description;
      if (status) updates.status = status;

      if (startTime) {
        const parsedStart = parseChineseTime(startTime);
        if (parsedStart) {
          updates.startTime = parsedStart.startTime;
        }
      }

      if (endTime) {
        const parsedEnd = parseChineseTime(endTime);
        if (parsedEnd) {
          updates.endTime = parsedEnd.endTime;
        }
      }

      // 执行更新
      const [updatedEvent] = await db
        .update(events)
        .set(updates)
        .where(eq(events.id, eventId))
        .returning();

      if (!updatedEvent) {
        return {
          success: false,
          error: '未找到指定的日程',
        };
      }

      return {
        success: true,
        data: {
          id: updatedEvent.id,
          title: updatedEvent.title,
          startTime: updatedEvent.startTime.toISOString(),
          endTime: updatedEvent.endTime.toISOString(),
        },
        message: `日程已更新: ${updatedEvent.title}`,
      };
    } catch (error) {
      console.error('更新日程失败:', error);
      return {
        success: false,
        error: `更新日程失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  },
});

// 删除日程工具
export const deleteEventTool = tool({
  description: '删除指定的日程事件。',
  parameters: z.object({
    eventId: z.string().describe('要删除的日程ID'),
  }),
  execute: async ({ eventId }) => {
    try {
      const [deletedEvent] = await db
        .delete(events)
        .where(eq(events.id, eventId))
        .returning();

      if (!deletedEvent) {
        return {
          success: false,
          error: '未找到指定的日程',
        };
      }

      return {
        success: true,
        data: {
          id: deletedEvent.id,
          title: deletedEvent.title,
        },
        message: `日程已删除: ${deletedEvent.title}`,
      };
    } catch (error) {
      console.error('删除日程失败:', error);
      return {
        success: false,
        error: `删除日程失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  },
});

// 查找空闲时间工具
export const findFreeTimeTool = tool({
  description: '查找用户的空闲时间段。用于推荐合适的会议或日程时间。',
  parameters: z.object({
    dateRange: z.string().optional().describe('日期范围描述，如"下周"、"这周"'),
    duration: z.number().optional().describe('需要的时长，单位分钟'),
    preferredTime: z.string().optional().describe('偏好的时间段，如"上午"、"下午"'),
  }),
  execute: async ({ dateRange, duration = 60, preferredTime }) => {
    try {
      // 临时用户ID
      const tempUserId = 'temp-user-001';

      // 解析日期范围
      let rangeStart: Date, rangeEnd: Date;
      if (dateRange?.includes('下周')) {
        const nextWeek = getNextWeek();
        rangeStart = nextWeek.start;
        rangeEnd = nextWeek.end;
      } else {
        const thisWeek = getThisWeek();
        rangeStart = thisWeek.start;
        rangeEnd = thisWeek.end;
      }

      // 获取该时间段内的所有事件
      const existingEvents = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.userId, tempUserId),
            eq(events.status, 'confirmed'),
            gte(events.startTime, rangeStart),
            lte(events.endTime, rangeEnd)
          )
        )
        .orderBy(events.startTime);

      // 生成推荐时间
      const freeSlots: { start: Date; end: Date }[] = [];
      const workHours = { start: 9, end: 18 };

      // 简单实现：按天检查空闲时间
      for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
        const dayStart = new Date(d.setHours(workHours.start, 0, 0, 0));
        const dayEnd = new Date(d.setHours(workHours.end, 0, 0, 0));

        // 找出当天的已有事件
        const dayEvents = existingEvents.filter(
          e => e.startTime >= dayStart && e.endTime <= dayEnd
        );

        // 找空闲时间段
        let currentTime = dayStart;
        for (const event of dayEvents) {
          if (event.startTime > currentTime) {
            const gapMinutes = (event.startTime.getTime() - currentTime.getTime()) / 60000;
            if (gapMinutes >= duration) {
              freeSlots.push({
                start: new Date(currentTime),
                end: event.startTime,
              });
            }
          }
          currentTime = event.endTime > currentTime ? event.endTime : currentTime;
        }

        // 检查最后一段
        if (dayEnd > currentTime) {
          const gapMinutes = (dayEnd.getTime() - currentTime.getTime()) / 60000;
          if (gapMinutes >= duration) {
            freeSlots.push({
              start: new Date(currentTime),
              end: dayEnd,
            });
          }
        }
      }

      // 根据偏好时间过滤
      let recommendedSlots = freeSlots;
      if (preferredTime) {
        if (preferredTime.includes('上午')) {
          recommendedSlots = freeSlots.filter(s => s.start.getHours() < 12);
        } else if (preferredTime.includes('下午')) {
          recommendedSlots = freeSlots.filter(s => s.start.getHours() >= 12 && s.start.getHours() < 18);
        }
      }

      return {
        success: true,
        data: {
          rangeStart: rangeStart.toISOString(),
          rangeEnd: rangeEnd.toISOString(),
          freeSlots: recommendedSlots.slice(0, 5).map(s => ({
            start: s.start.toISOString(),
            end: s.end.toISOString(),
          })),
          message: `找到了 ${recommendedSlots.length} 个空闲时间段`,
        },
      };
    } catch (error) {
      console.error('查找空闲时间失败:', error);
      return {
        success: false,
        error: `查找空闲时间失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  },
});

// 导出所有工具
export const scheduleTools = {
  createEvent: createEventTool,
  queryEvents: queryEventsTool,
  updateEvent: updateEventTool,
  deleteEvent: deleteEventTool,
  findFreeTime: findFreeTimeTool,
};
