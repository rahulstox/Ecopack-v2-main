import { NextResponse } from 'next/server';
import { testGeminiModels } from '@/lib/models-test';

export async function GET() {
  try {
    const results = await testGeminiModels();
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message
    }, { status: 500 });
  }
}

