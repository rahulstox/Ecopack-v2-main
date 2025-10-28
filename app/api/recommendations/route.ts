import { NextResponse } from 'next/server';
import { getAllRecommendations } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const recommendations = await getAllRecommendations();
    const response = NextResponse.json({ success: true, data: recommendations });
    
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

