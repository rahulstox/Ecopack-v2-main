import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const hasGoogleApiKey = !!process.env.GOOGLE_API_KEY;
    const hasOpenAiKey = !!process.env.OPENAI_API_KEY;
    
    return NextResponse.json({
      database_configured: hasDatabaseUrl,
      google_api_configured: hasGoogleApiKey,
      openai_api_configured: hasOpenAiKey,
      database_length: hasDatabaseUrl ? process.env.DATABASE_URL?.length : 0,
      google_api_length: hasGoogleApiKey ? process.env.GOOGLE_API_KEY?.length : 0,
      openai_api_length: hasOpenAiKey ? process.env.OPENAI_API_KEY?.length : 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

