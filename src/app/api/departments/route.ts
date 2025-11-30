import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const departments = [
      { code: 'CSE', name: 'Computer Science and Engineering' },
      { code: 'EEE', name: 'Electrical and Electronic Engineering' },
      { code: 'CE', name: 'Civil Engineering' },
      { code: 'ME', name: 'Mechanical Engineering' },
      { code: 'TE', name: 'Textile Engineering' },
      { code: 'Architecture', name: 'Architecture' },
      { code: 'BBA', name: 'Business Administration' },
      { code: 'English', name: 'English' },
      { code: 'Law', name: 'Law' },
      { code: 'Administration', name: 'Administration' }
    ];

    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}