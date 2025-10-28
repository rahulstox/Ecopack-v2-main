import { NextRequest, NextResponse } from 'next/server';
import { getRecommendationById } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const recommendation = await getRecommendationById(id);
    
    if (!recommendation) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: recommendation });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch recommendation' }, { status: 500 });
  }
}

