/**
 * 时间解析工具
 * 将中文自然语言时间表达转换为具体日期时间
 */

import { parse, format, addDays, startOfWeek, endOfWeek, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday, nextSunday, setHours, setMinutes, isValid } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export interface ParsedTime {
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  confidence: number; // 0-1，表示解析置信度
}

/**
 * 解析中文时间表达
 * @param input 用户输入的时间描述
 * @returns 解析结果
 */
export function parseChineseTime(input: string): ParsedTime | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 相对时间映射
  const relativeDays: Record<string, () => Date> = {
    '今天': () => today,
    '今日': () => today,
    '明天': () => addDays(today, 1),
    '明日': () => addDays(today, 1),
    '后天': () => addDays(today, 2),
    '大后天': () => addDays(today, 3),
    '昨天': () => addDays(today, -1),
    '前天': () => addDays(today, -2),
  };

  // 星期映射
  const weekDays: Record<string, (date: Date) => Date> = {
    '周一': nextMonday,
    '星期一': nextMonday,
    '下周二': nextTuesday,
    '周二': nextTuesday,
    '星期二': nextTuesday,
    '下周三': nextWednesday,
    '周三': nextWednesday,
    '星期三': nextWednesday,
    '下周四': nextThursday,
    '周四': nextThursday,
    '星期四': nextThursday,
    '下周五': nextFriday,
    '周五': nextFriday,
    '星期五': nextFriday,
    '下周六': nextSaturday,
    '周六': nextSaturday,
    '星期六': nextSaturday,
    '下周日': nextSunday,
    '周日': nextSunday,
    '星期日': nextSunday,
    '下周天': nextSunday,
    '周天': nextSunday,
  };

  let targetDate: Date | null = null;
  let isAllDay = false;
  let confidence = 0.5;

  // 尝试匹配相对日期
  for (const [keyword, getDate] of Object.entries(relativeDays)) {
    if (input.includes(keyword)) {
      targetDate = getDate();
      confidence = 0.9;
      break;
    }
  }

  // 尝试匹配星期
  if (!targetDate) {
    for (const [keyword, getNextDay] of Object.entries(weekDays)) {
      if (input.includes(keyword)) {
        targetDate = getNextDay(today);
        confidence = 0.8;
        break;
      }
    }
  }

  // 尝试匹配具体日期格式 (如 "4月18日", "04-18", "2024-04-18")
  if (!targetDate) {
    const datePatterns = [
      /(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})[日号]?/,  // 2024年4月18日
      /(\d{1,2})[月/-](\d{1,2})[日号]?/,              // 4月18日
    ];

    for (const pattern of datePatterns) {
      const match = input.match(pattern);
      if (match) {
        if (match.length === 4) {
          // 完整日期
          const year = parseInt(match[1]);
          const month = parseInt(match[2]) - 1;
          const day = parseInt(match[3]);
          targetDate = new Date(year, month, day);
          confidence = 0.95;
        } else if (match.length === 3) {
          // 月日
          const month = parseInt(match[1]) - 1;
          const day = parseInt(match[2]);
          targetDate = new Date(now.getFullYear(), month, day);
          // 如果日期已过，使用明年
          if (targetDate < today) {
            targetDate = new Date(now.getFullYear() + 1, month, day);
          }
          confidence = 0.9;
        }
        break;
      }
    }
  }

  if (!targetDate) {
    return null;
  }

  // 解析时间部分
  let startTime = targetDate;
  let endTime = targetDate;

  // 时间匹配模式
  const timePatterns = [
    /(\d{1,2}):(\d{2})/,                    // 14:30
    /(\d{1,2})点(\d{1,2})?分?/,             // 2点30分
    /(上午|下午|晚上|傍晚|晚上)?(\d{1,2})点/, // 下午3点
  ];

  let timeParsed = false;
  for (const pattern of timePatterns) {
    const match = input.match(pattern);
    if (match) {
      let hours: number;
      let minutes = 0;

      if (pattern === timePatterns[0]) {
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
      } else if (pattern === timePatterns[1]) {
        hours = parseInt(match[1]);
        minutes = match[2] ? parseInt(match[2]) : 0;
      } else {
        const period = match[1];
        hours = parseInt(match[2]);
        // 处理上午/下午
        if (period === '下午' || period === '晚上' || period === '傍晚') {
          if (hours < 12) hours += 12;
        } else if (period === '上午' && hours === 12) {
          hours = 0;
        }
      }

      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        startTime = setHours(setMinutes(targetDate, minutes), hours);
        // 默认事件持续1小时
        endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        timeParsed = true;
        confidence = Math.min(confidence + 0.1, 1);
        break;
      }
    }
  }

  // 如果没有解析到具体时间，设为全天事件
  if (!timeParsed) {
    isAllDay = true;
    startTime = targetDate;
    endTime = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000 - 1);
  }

  return {
    startTime,
    endTime,
    isAllDay,
    confidence,
  };
}

/**
 * 格式化日期为中文
 */
export function formatDateChinese(date: Date): string {
  return format(date, 'yyyy年M月d日 EEEE HH:mm', { locale: zhCN });
}

/**
 * 检查时间范围是否有冲突
 */
export function hasTimeConflict(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * 获取本周的开始和结束时间
 */
export function getThisWeek(): { start: Date; end: Date } {
  return {
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  };
}

/**
 * 获取下周的开始和结束时间
 */
export function getNextWeek(): { start: Date; end: Date } {
  const nextWeekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7);
  return {
    start: nextWeekStart,
    end: addDays(nextWeekStart, 6),
  };
}
