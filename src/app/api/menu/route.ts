import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { menuItems } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const available = searchParams.get('available');
    const search = searchParams.get('search');

    let query = db.select().from(menuItems);
    const conditions = [];

    if (category) {
      conditions.push(eq(menuItems.category, category));
    }

    if (available !== null) {
      conditions.push(eq(menuItems.available, available === 'true'));
    }

    if (search) {
      conditions.push(
        or(
          like(menuItems.name, `%${search}%`),
          like(menuItems.description, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const results = await query;

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, category, imageUrl, available } = body;

    // Validation: Required fields
    if (!name || price === undefined || !category) {
      return NextResponse.json(
        {
          error: 'Name, price and category are required',
          code: 'MISSING_REQUIRED_FIELDS',
        },
        { status: 400 }
      );
    }

    // Validation: Price must be positive
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        {
          error: 'Price must be a positive number',
          code: 'INVALID_PRICE',
        },
        { status: 400 }
      );
    }

    // Validation: Category must be valid
    const validCategories = ['snacks', 'beverages', 'sweets'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          error: 'Category must be snacks, beverages, or sweets',
          code: 'INVALID_CATEGORY',
        },
        { status: 400 }
      );
    }

    // Create new menu item
    const newMenuItem = await db
      .insert(menuItems)
      .values({
        name: name.trim(),
        description: description || null,
        price: price,
        category: category,
        imageUrl: imageUrl || null,
        available: available !== undefined ? available : true,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newMenuItem[0], { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}