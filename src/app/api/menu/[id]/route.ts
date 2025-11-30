import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { menuItems } from '@/db/schema';
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
        { error: 'Valid menu item ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Query menu item
    const menuItem = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, parseInt(id)))
      .limit(1);

    // Check if menu item exists
    if (menuItem.length === 0) {
      return NextResponse.json(
        { error: 'Menu item not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(menuItem[0], { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
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
        { error: 'Valid menu item ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, price, category, imageUrl, available } = body;

    // Validate price if provided
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return NextResponse.json(
        { error: 'Price must be a positive number', code: 'INVALID_PRICE' },
        { status: 400 }
      );
    }

    // Validate category if provided
    const validCategories = ['snacks', 'beverages', 'sweets'];
    if (category !== undefined && !validCategories.includes(category)) {
      return NextResponse.json(
        {
          error: 'Category must be snacks, beverages, or sweets',
          code: 'INVALID_CATEGORY',
        },
        { status: 400 }
      );
    }

    // Check if menu item exists
    const existingMenuItem = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, parseInt(id)))
      .limit(1);

    if (existingMenuItem.length === 0) {
      return NextResponse.json(
        { error: 'Menu item not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updates: any = {};

    if (name !== undefined) {
      updates.name = name.trim();
    }
    if (description !== undefined) {
      updates.description = description.trim();
    }
    if (price !== undefined) {
      updates.price = price;
    }
    if (category !== undefined) {
      updates.category = category;
    }
    if (imageUrl !== undefined) {
      updates.imageUrl = imageUrl;
    }
    if (available !== undefined) {
      updates.available = available;
    }

    // Update menu item
    const updatedMenuItem = await db
      .update(menuItems)
      .set(updates)
      .where(eq(menuItems.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedMenuItem[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid menu item ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if menu item exists
    const existingMenuItem = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, parseInt(id)))
      .limit(1);

    if (existingMenuItem.length === 0) {
      return NextResponse.json(
        { error: 'Menu item not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete menu item
    await db
      .delete(menuItems)
      .where(eq(menuItems.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Menu item deleted successfully',
        deletedId: id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}