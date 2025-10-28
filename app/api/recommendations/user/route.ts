import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserRecommendations } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const recommendations = await getUserRecommendations(userId);

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error: any) {
    console.error("Error fetching user recommendations:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
