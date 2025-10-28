import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Clear all recommendations from database
export async function POST() {
  try {
    await sql`DELETE FROM recommendations`;
    return NextResponse.json({ 
      success: true, 
      message: 'All recommendations cleared. Submit a new recommendation to see AI-generated results!' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

