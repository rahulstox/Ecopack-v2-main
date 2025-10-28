import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    console.log("🔧 Starting timestamp fix...");

    // Step 1: Check current table structure
    const columns = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'actionlog'
      ORDER BY ordinal_position;
    `;

    console.log("📋 ActionLog columns found:", columns.length);

    // Step 2: Add column if missing (case-insensitive check)
    const hasLoggedAt = columns.some(
      (col: any) => col.column_name.toLowerCase() === "loggedat"
    );

    if (!hasLoggedAt) {
      console.log("❌ loggedAt column NOT found. Adding it...");
      await sql`
        ALTER TABLE ActionLog 
        ADD COLUMN loggedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `;
      console.log("✅ Added loggedAt column with DEFAULT CURRENT_TIMESTAMP");
    } else {
      console.log("✅ loggedAt column already exists");
    }

    // Step 3: Update NULL values in existing rows
    await sql`
      UPDATE ActionLog 
      SET loggedAt = CURRENT_TIMESTAMP 
      WHERE loggedAt IS NULL;
    `;
    console.log("✅ Updated NULL timestamps to CURRENT_TIMESTAMP");

    // Step 4: Get sample data to verify
    const sample = await sql`
      SELECT id, userid, category, activity, amount, loggedat
      FROM ActionLog 
      ORDER BY id DESC
      LIMIT 3;
    `;

    console.log("📊 Sample data after fix:", sample);

    return NextResponse.json({
      success: true,
      message: "Timestamps fixed successfully!",
      columnsFound: columns.length,
      hadLoggedAt: hasLoggedAt,
      sampleData: sample,
    });
  } catch (error: any) {
    console.error("❌ Error in fix-timestamps:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        errorType: error.constructor.name,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
