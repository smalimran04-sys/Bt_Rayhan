import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, department, phone } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { 
          error: 'Email, password, and name are required',
          code: 'MISSING_REQUIRED_FIELDS'
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();
    const sanitizedDepartment = department ? department.trim() : 'Not Specified';

    // Validate email format
    if (!sanitizedEmail.includes('@')) {
      return NextResponse.json(
        { 
          error: 'Invalid email or password format',
          code: 'INVALID_FORMAT'
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { 
          error: 'Invalid email or password format',
          code: 'INVALID_FORMAT'
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, sanitizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { 
          error: 'User with this email already exists',
          code: 'USER_EXISTS'
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await db.insert(users)
      .values({
        email: sanitizedEmail,
        password: hashedPassword,
        role: 'customer',
        name: sanitizedName,
        department: sanitizedDepartment,
        phone: phone || null,
        createdAt: new Date().toISOString()
      })
      .returning();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser[0];

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: 'Registration successful'
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