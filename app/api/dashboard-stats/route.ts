import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getActionLogsByUserId } from "@/lib/db";

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

    // Get all logs for stats calculation
    const allLogs = await getActionLogsByUserId(userId, 1000, 0);

    // Calculate stats with null safety - convert to numbers
    const totalCo2e = allLogs.reduce(
      (sum, log) => sum + Number(log.calculatedCo2e || 0),
      0
    );
    const totalActions = allLogs.length;

    console.log("📊 Dashboard Stats:", {
      totalLogs: allLogs.length,
      totalCo2e,
      totalActions,
    });

    // Get logs from this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthLogs = allLogs.filter((log) => {
      if (!log.loggedAt) return false;
      const logDate = new Date(log.loggedAt);
      return logDate >= firstDayOfMonth;
    });

    const thisMonthCo2e = thisMonthLogs.reduce(
      (sum, log) => sum + Number(log.calculatedCo2e || 0),
      0
    );
    const thisMonthActions = thisMonthLogs.length;

    // Calculate category breakdown with null safety
    const categoryBreakdown = allLogs.reduce((acc, log) => {
      const value = Number(log.calculatedCo2e || 0);
      acc[log.category] = (acc[log.category] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average per action
    const averagePerAction = totalActions > 0 ? totalCo2e / totalActions : 0;

    return NextResponse.json({
      success: true,
      totalCo2e,
      totalActions,
      thisMonthCo2e,
      thisMonthActions,
      categoryBreakdown,
      averagePerAction,
    });
  } catch (error: any) {
    console.error("❌ API /api/dashboard-stats Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch dashboard stats",
      },
      { status: 500 }
    );
  }
}
