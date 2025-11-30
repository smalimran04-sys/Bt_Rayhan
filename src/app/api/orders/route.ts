import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, menuItems } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const orderType = searchParams.get('orderType');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db.select().from(orders);

    const conditions = [];

    if (userId) {
      conditions.push(eq(orders.userId, parseInt(userId)));
    }

    if (status) {
      conditions.push(eq(orders.orderStatus, status));
    }

    if (orderType) {
      conditions.push(eq(orders.orderType, orderType));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, orderType, scheduledDate, paymentMethod, department, items } = body;

    // Validate required fields
    if (!userId || !orderType || !paymentMethod || !department || !items) {
      return NextResponse.json(
        {
          error: 'userId, orderType, paymentMethod, department and items are required',
          code: 'MISSING_REQUIRED_FIELDS',
        },
        { status: 400 }
      );
    }

    // Validate orderType
    if (orderType !== 'instant' && orderType !== 'scheduled') {
      return NextResponse.json(
        {
          error: 'orderType must be instant or scheduled',
          code: 'INVALID_ORDER_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate scheduledDate for scheduled orders
    if (orderType === 'scheduled' && !scheduledDate) {
      return NextResponse.json(
        {
          error: 'scheduledDate is required for scheduled orders',
          code: 'MISSING_SCHEDULED_DATE',
        },
        { status: 400 }
      );
    }

    // Validate paymentMethod
    if (!['bkash', 'nagad', 'card'].includes(paymentMethod)) {
      return NextResponse.json(
        {
          error: 'paymentMethod must be bkash, nagad, or card',
          code: 'INVALID_PAYMENT_METHOD',
        },
        { status: 400 }
      );
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: 'Order must contain at least one item',
          code: 'EMPTY_ORDER',
        },
        { status: 400 }
      );
    }

    // Fetch and validate menu items, calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const menuItem = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.id, item.menuItemId))
        .limit(1);

      if (menuItem.length === 0) {
        return NextResponse.json(
          {
            error: 'Menu item not found',
            code: 'MENU_ITEM_NOT_FOUND',
            menuItemId: item.menuItemId,
          },
          { status: 404 }
        );
      }

      if (!menuItem[0].available) {
        return NextResponse.json(
          {
            error: 'Menu item not available',
            code: 'MENU_ITEM_UNAVAILABLE',
            menuItemId: item.menuItemId,
          },
          { status: 400 }
        );
      }

      const itemTotal = menuItem[0].price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem[0].price,
      });
    }

    // Create order
    const newOrder = await db
      .insert(orders)
      .values({
        userId: userId,
        orderType: orderType,
        scheduledDate: scheduledDate || null,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        department: department,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    const createdOrder = newOrder[0];

    // Create order items
    const createdOrderItems = [];
    for (const item of validatedItems) {
      const orderItem = await db
        .insert(orderItems)
        .values({
          orderId: createdOrder.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          createdAt: new Date().toISOString(),
        })
        .returning();

      createdOrderItems.push(orderItem[0]);
    }

    return NextResponse.json(
      {
        order: createdOrder,
        orderItems: createdOrderItems,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}