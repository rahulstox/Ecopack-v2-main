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
