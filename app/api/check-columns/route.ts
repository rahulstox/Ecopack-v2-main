import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get actual column names from database
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'actionlog'
      ORDER BY ordinal_position;
    `;

    // Get one sample record to see structure
    const sample = await sql`
      SELECT * FROM ActionLog LIMIT 1;
    `;

    return NextResponse.json({
      success: true,
      columns: columns,
      sampleRecord: sample[0] || null,
      allKeys: sample[0] ? Object.keys(sample[0]) : [],
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
