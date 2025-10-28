import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get total quiz completions
    const [result] = await sql`
      SELECT COUNT(*) as total_quizzes, AVG(percentage) as avg_score, 
             COUNT(CASE WHEN score >= 5 THEN 1 END) as passed
      FROM quiz_results
    `;

    return NextResponse.json({
      success: true,
      totalQuizzes: result.total_quizzes || 0,
      avgScore: result.avg_score || 0,
      passed: result.passed || 0,
    });
  } catch (error: any) {
    console.error("Error fetching quiz stats:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
