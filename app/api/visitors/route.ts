import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [result] = await sql`
      SELECT visit_count FROM site_stats WHERE id = 1
    `;

    return NextResponse.json({
      success: true,
      count: result?.visit_count || 0,
    });
  } catch (error: any) {
    // If table doesn't exist, return 0
    return NextResponse.json({
      success: true,
      count: 0,
    });
  }
}

export async function POST() {
  try {
    // Check if record exists
    const [existing] = await sql`
      SELECT visit_count FROM site_stats WHERE id = 1
    `;

    if (!existing || !existing.visit_count) {
      // Initialize with 25 if doesn't exist
      await sql`
        INSERT INTO site_stats (id, visit_count, last_updated)
        VALUES (1, 25, CURRENT_TIMESTAMP)
      `;
    } else {
      // Increment visitor count
      await sql`
        UPDATE site_stats 
        SET visit_count = visit_count + 1, last_updated = CURRENT_TIMESTAMP
        WHERE id = 1
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error incrementing visitor count:", error);
    return NextResponse.json({ success: true }); // Silent fail
  }
}
