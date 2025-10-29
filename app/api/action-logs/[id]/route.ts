import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    // Check if the log belongs to the current user
    const existingLog = await sql`
      SELECT * FROM ActionLog WHERE id = ${id} AND userId = ${userId}
    `;

    if (!existingLog || existingLog.length === 0) {
      return NextResponse.json(
        { success: false, error: "Log not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the log
    await sql`
      DELETE FROM ActionLog WHERE id = ${id} AND userId = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: "Action log deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ API /api/action-logs/[id] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete action log",
      },
      { status: 500 }
    );
  }
}
