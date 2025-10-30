import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get quiz attempts count
    const attempts = await sql`
      SELECT COUNT(*) as count FROM quiz_results WHERE userid = ${userId}
    `;
    const attemptCount = Number(attempts[0]?.count || 0);
    const attemptsRemaining = Math.max(0, 2 - attemptCount);
    const canTakeQuiz = attemptCount < 2;

    // Check if user has any reward eligibility
    const rewardEligibleResults = await sql`
      SELECT COUNT(*) as count FROM quiz_results 
      WHERE userid = ${userId} AND reward_eligible = TRUE
    `;
    const hasRewardEligible = Number(rewardEligibleResults[0]?.count || 0) > 0;

    return NextResponse.json({
      success: true,
      attemptCount,
      attemptsRemaining,
      canTakeQuiz,
      hasRewardEligible,
    });
  } catch (error: any) {
    console.error("Error checking quiz attempts:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

