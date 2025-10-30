import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    const rows =
      (await sql`SELECT "username" FROM "UserProfile" WHERE "userId" = ${userId}`) as any[];
    return NextResponse.json({
      success: true,
      username: rows[0]?.username || null,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    const body = await req.json();
    const username = (body?.username || "").trim();
    if (
      !username ||
      username.length < 3 ||
      username.length > 24 ||
      /[^a-zA-Z0-9_\.\-]/.test(username)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid username" },
        { status: 400 }
      );
    }

    // Check uniqueness (case-insensitive)
    const existing = (await sql`
      SELECT 1 FROM "UserProfile" WHERE lower("username") = lower(${username}) AND "userId" <> ${userId} LIMIT 1
    `) as any[];
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "Username already taken" },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO "UserProfile" ("userId", "username", "createdAt", "updatedAt")
      VALUES (${userId}, ${username}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("userId") DO UPDATE SET "username" = EXCLUDED."username", "updatedAt" = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true, username });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Failed" },
      { status: 500 }
    );
  }
}
