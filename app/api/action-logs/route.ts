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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const logs = await getActionLogsByUserId(userId, limit, offset);

    console.log("📋 Returning logs to client:", logs.length);
    if (logs.length > 0) {
      console.log("📅 First log loggedAt value:", logs[0].loggedAt);
    }

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    console.error("❌ API /api/action-logs Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch action logs" },
      { status: 500 }
    );
  }
}
