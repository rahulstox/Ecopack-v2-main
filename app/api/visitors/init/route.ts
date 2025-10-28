import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Initialize with 25 visitors
    await sql`
      INSERT INTO site_stats (id, visit_count, last_updated)
      VALUES (1, 25, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        visit_count = 25,
        last_updated = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({
      success: true,
      message: "Visitor count initialized to 25",
    });
  } catch (error: any) {
    console.error("Error initializing visitor count:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
