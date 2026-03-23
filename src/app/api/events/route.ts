/**
 * Events API Route
 * CRUD操作日程事件
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET - 查询事件
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId') || 'temp-user-001';

    // 构建查询条件
    const conditions = [eq(events.userId, userId)];

    if (startDate) {
      conditions.push(gte(events.startTime, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(events.endTime, new Date(endDate)));
    }

    const results = await db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(desc(events.startTime));

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('获取事件失败:', error);
    return NextResponse.json(
      { success: false, error: '获取事件失败' },
      { status: 500 }
    );
  }
}

// POST - 创建事件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, startTime, endTime, location, description, isAllDay, userId = 'temp-user-001' } = body;

    const [newEvent] = await db.insert(events).values({
      id: nanoid(),
      userId,
      title,
      description: description || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location: location || null,
      isAllDay: isAllDay || false,
      status: 'confirmed',
    }).returning();

    return NextResponse.json({
      success: true,
      data: newEvent,
    });
  } catch (error) {
    console.error('创建事件失败:', error);
    return NextResponse.json(
      { success: false, error: '创建事件失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新事件
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const [updatedEvent] = await db
      .update(events)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    if (!updatedEvent) {
      return NextResponse.json(
        { success: false, error: '事件不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    console.error('更新事件失败:', error);
    return NextResponse.json(
      { success: false, error: '更新事件失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除事件
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少事件ID' },
        { status: 400 }
      );
    }

    const [deletedEvent] = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning();

    if (!deletedEvent) {
      return NextResponse.json(
        { success: false, error: '事件不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deletedEvent,
    });
  } catch (error) {
    console.error('删除事件失败:', error);
    return NextResponse.json(
      { success: false, error: '删除事件失败' },
      { status: 500 }
    );
  }
}
