import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const revalidate = 0;

export async function GET() {
  try {
    // Ensure optional username column exists in production
    try {
      await sql`ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "username" VARCHAR(100)`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_userprofile_username_unique ON "UserProfile"(lower("username")) WHERE "username" IS NOT NULL`;
    } catch {
      // ignore
    }
    // Aggregate total CO2e saved by user and join username if available
    const rows = (await sql`
      WITH totals AS (
        SELECT 
          a.userid as "userId",
          -- Treat negative values as savings by flipping sign
          COALESCE(SUM(CASE WHEN a.calculatedco2e < 0 THEN -a.calculatedco2e ELSE a.calculatedco2e END), 0) as "totalSaved"
        FROM ActionLog a
        GROUP BY a.userid
      )
      SELECT t."userId", t."totalSaved", up."username"
      FROM totals t
      LEFT JOIN "UserProfile" up ON up."userId" = t."userId"
      WHERE t."totalSaved" > 0
      ORDER BY t."totalSaved" DESC
      LIMIT 100;
    `) as any[];

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}
