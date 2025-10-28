import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { score, total, percentage } = body;

    // Save quiz result
    await sql`
      INSERT INTO quiz_results (userid, score, total, percentage, completedat)
      VALUES (${userId}, ${score}, ${total}, ${percentage}, CURRENT_TIMESTAMP)
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving quiz result:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
