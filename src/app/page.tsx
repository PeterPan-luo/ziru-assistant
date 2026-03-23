'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 消息类型
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  toolInvocations?: ToolInvocation[];
}

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  state: 'partial-call' | 'call' | 'result';
  result?: {
    success: boolean;
    data?: unknown;
    message?: string;
  };
}

// 事件类型
interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string | null;
  status: string;
}

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [viewMode, setViewMode] = useState<'chat' | 'calendar'>('chat');

  // 使用Vercel AI SDK的useChat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    onToolCall: ({ toolCall }) => {
      console.log('Tool call:', toolCall);
    },
    onFinish: (message) => {
      console.log('Message finished:', message);
      // 刷新事件列表
      fetchEvents();
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 获取事件列表
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('获取事件失败:', error);
    }
  };

  // 初始化时获取事件
  useEffect(() => {
    fetchEvents();
  }, []);

  // 生成日历日期
  const calendarDays = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    // 添加前缀空白天
    const startDay = start.getDay();
    const prefixDays = Array(startDay === 0 ? 6 : startDay - 1).fill(null);

    return [...prefixDays, ...days];
  };

  // 检查某天是否有事件
  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventDate = parseISO(event.startTime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">自</span>
          </div>
          <h1 className="text-lg font-semibold">自如助手</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('chat')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'chat'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            对话
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            日历
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 主内容区 */}
        <main className="flex-1 flex flex-col">
          {viewMode === 'chat' ? (
            <>
              {/* 聊天消息区域 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary-500 text-2xl">自</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      你好，我是自如助手
                    </h2>
                    <p className="text-gray-500 mb-6">
                      我可以帮你管理日程和记录费用，试着说：
                    </p>
                    <div className="space-y-2 max-w-md mx-auto">
                      {[
                        '4月18号我要参加AI研讨会',
                        '明天下午3点约了客户',
                        '这周有什么安排？',
                        '下周什么时候有空开会？',
                      ].map((example) => (
                        <button
                          key={example}
                          onClick={() => {
                            const event = {
                              target: { value: example },
                            } as React.ChangeEvent<HTMLInputElement>;
                            handleInputChange(event);
                          }}
                          className="block w-full text-left px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-sm text-gray-700"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`message ${
                        message.role === 'user'
                          ? 'message-user'
                          : 'message-assistant'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>

                      {/* 显示工具调用 */}
                      {message.toolInvocations?.map((toolInvocation) => (
                        <div key={toolInvocation.toolCallId} className="tool-call mt-2">
                          <div className="tool-call-header">
                            🔧 {toolInvocation.toolName}
                          </div>
                          {toolInvocation.state === 'result' && (
                            <div className="text-xs text-green-600">
                              {toolInvocation.result?.message || '执行成功'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* 加载指示器 */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="message message-assistant">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="border-t bg-white p-4">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="说点什么..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    发送
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              {/* 日历视图 */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* 月份导航 */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() =>
                      setCurrentDate(
                        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
                      )
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ←
                  </button>
                  <h2 className="text-lg font-semibold">
                    {format(currentDate, 'yyyy年M月', { locale: zhCN })}
                  </h2>
                  <button
                    onClick={() =>
                      setCurrentDate(
                        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
                      )
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    →
                  </button>
                </div>

                {/* 星期标题 */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-gray-500 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* 日历格子 */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays().map((day, index) => {
                    if (!day) {
                      return <div key={`empty-${index}`} className="p-2" />;
                    }

                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isTodayDate = isToday(day);

                    return (
                      <div
                        key={day.toISOString()}
                        className={`calendar-day min-h-[80px] ${
                          !isCurrentMonth ? 'text-gray-400' : ''
                        } ${isTodayDate ? 'calendar-day-today' : ''}`}
                      >
                        <span className="text-sm">{format(day, 'd')}</span>
                        {dayEvents.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className="text-xs bg-primary-100 text-primary-700 rounded px-1 py-0.5 truncate"
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{dayEvents.length - 2} 更多
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 今日事件列表 */}
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">今日日程</h3>
                  <div className="space-y-2">
                    {events
                      .filter((event) => {
                        const eventDate = parseISO(event.startTime);
                        return isToday(eventDate);
                      })
                      .map((event) => (
                        <div key={event.id} className="event-card">
                          <div className="event-card-time">
                            {format(parseISO(event.startTime), 'HH:mm')} -{' '}
                            {format(parseISO(event.endTime), 'HH:mm')}
                          </div>
                          <div className="event-card-title">{event.title}</div>
                          {event.location && (
                            <div className="event-card-location">📍 {event.location}</div>
                          )}
                        </div>
                      ))}
                    {events.filter((event) => {
                      const eventDate = parseISO(event.startTime);
                      return isToday(eventDate);
                    }).length === 0 && (
                      <p className="text-gray-500 text-sm">今天没有日程安排</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        {/* 侧边栏 - 最近事件 */}
        <aside className="w-80 border-l bg-white p-4 hidden lg:block overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3">最近日程</h3>
          <div className="space-y-2">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-time">
                  {format(parseISO(event.startTime), 'M月d日 HH:mm', { locale: zhCN })}
                </div>
                <div className="event-card-title">{event.title}</div>
                {event.location && (
                  <div className="event-card-location">📍 {event.location}</div>
                )}
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-gray-500 text-sm">暂无日程</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
