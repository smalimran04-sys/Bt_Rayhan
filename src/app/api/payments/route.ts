import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, paymentMethod, transactionId, paymentStatus } = body;

    // Validate required fields
    if (!orderId || !amount || !paymentMethod) {
      return NextResponse.json(
        { 
          error: "orderId, amount and paymentMethod are required",
          code: "MISSING_REQUIRED_FIELDS" 
        },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { 
          error: "Amount must be a positive number",
          code: "INVALID_AMOUNT" 
        },
        { status: 400 }
      );
    }

    // Validate payment method
    const validPaymentMethods = ['bkash', 'nagad', 'card'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { 
          error: "paymentMethod must be bkash, nagad, or card",
          code: "INVALID_PAYMENT_METHOD" 
        },
        { status: 400 }
      );
    }

    // Validate payment status if provided
    if (paymentStatus) {
      const validPaymentStatuses = ['pending', 'completed'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          { 
            error: "paymentStatus must be pending or completed",
            code: "INVALID_PAYMENT_STATUS" 
          },
          { status: 400 }
        );
      }
    }

    // Check if order exists
    const existingOrder = await db.select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { 
          error: "Order not found",
          code: "ORDER_NOT_FOUND" 
        },
        { status: 404 }
      );
    }

    // Create payment record
    const newPayment = await db.insert(payments)
      .values({
        orderId,
        amount,
        paymentMethod,
        transactionId: transactionId || null,
        paymentStatus: paymentStatus || 'completed',
        createdAt: new Date().toISOString()
      })
      .returning();

    // Update order payment status if payment is completed
    if ((paymentStatus || 'completed') === 'completed') {
      await db.update(orders)
        .set({
          paymentStatus: 'completed',
          updatedAt: new Date().toISOString()
        })
        .where(eq(orders.id, orderId));
    }

    return NextResponse.json(
      {
        payment: newPayment[0],
        message: "Payment recorded successfully"
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