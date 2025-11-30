import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, menuItems, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid order ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Query order
    const orderResult = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (orderResult.length === 0) {
      return NextResponse.json(
        { 
          error: 'Order not found',
          code: 'NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const order = orderResult[0];

    // Query order items with menu item details
    const orderItemsResult = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        menuItemId: orderItems.menuItemId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        createdAt: orderItems.createdAt,
        menuItem: {
          id: menuItems.id,
          name: menuItems.name,
          description: menuItems.description,
          category: menuItems.category,
          imageUrl: menuItems.imageUrl,
          price: menuItems.price,
        },
      })
      .from(orderItems)
      .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, parseInt(id)));

    // Query user information
    const userResult = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        department: users.department,
      })
      .from(users)
      .where(eq(users.id, order.userId))
      .limit(1);

    const user = userResult.length > 0 ? userResult[0] : null;

    return NextResponse.json(
      {
        order,
        orderItems: orderItemsResult,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid order ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { 
          error: 'Order not found',
          code: 'NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { orderStatus, paymentStatus, scheduledDate } = body;

    // Validate orderStatus if provided
    if (orderStatus !== undefined) {
      const validOrderStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
      if (!validOrderStatuses.includes(orderStatus)) {
        return NextResponse.json(
          { 
            error: 'Invalid order status',
            code: 'INVALID_ORDER_STATUS' 
          },
          { status: 400 }
        );
      }
    }

    // Validate paymentStatus if provided
    if (paymentStatus !== undefined) {
      const validPaymentStatuses = ['pending', 'completed'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          { 
            error: 'Invalid payment status',
            code: 'INVALID_PAYMENT_STATUS' 
          },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (orderStatus !== undefined) {
      updates.orderStatus = orderStatus;
    }

    if (paymentStatus !== undefined) {
      updates.paymentStatus = paymentStatus;
    }

    if (scheduledDate !== undefined) {
      updates.scheduledDate = scheduledDate;
    }

    // Update order
    const updatedOrder = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedOrder[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}