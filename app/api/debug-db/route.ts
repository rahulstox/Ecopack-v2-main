import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();

    // Get raw data to see actual column names
    const rawData = await sql`
      SELECT * 
      FROM ActionLog 
      LIMIT 1;
    `;

    // Get column info
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'actionlog'
      ORDER BY ordinal_position;
    `;

    // Try different case variations
    const test1 = await sql`SELECT loggedAt FROM ActionLog LIMIT 1;`;
    const test2 = await sql`SELECT "loggedAt" FROM ActionLog LIMIT 1;`;
    const test3 = await sql`SELECT loggedat FROM ActionLog LIMIT 1;`;

    return NextResponse.json({
      success: true,
      rawData: rawData,
      columns: columns,
      tests: {
        unquoted_camelCase: test1,
        quoted_camelCase: test2,
        lowercase: test3,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
}
