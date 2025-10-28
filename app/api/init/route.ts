import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // Initialize tables
    await sql`
      CREATE TABLE IF NOT EXISTS recommendations (
        id SERIAL PRIMARY KEY,
        form_input JSONB NOT NULL,
        ai_output JSONB NOT NULL,
        carbon_score NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS "UserProfile" (
        "userId" VARCHAR(255) PRIMARY KEY,
        "primaryVehicleType" VARCHAR(100),
        "fuelType" VARCHAR(50),
        "householdSize" INTEGER,
        "dietType" VARCHAR(100),
        "homeEnergySource" VARCHAR(100),
        "commuteDistance" NUMERIC,
        "commuteMode" VARCHAR(100),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS ActionLog (
        id SERIAL PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        activity VARCHAR(100) NOT NULL,
        amount NUMERIC NOT NULL,
        unit VARCHAR(50) NOT NULL,
        calculatedCo2e NUMERIC NOT NULL,
        rawInput TEXT,
        loggedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return NextResponse.json({
      success: true,
      message: "Database tables initialized successfully",
    });
  } catch (error: any) {
    console.error("Init error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to initialize database",
      },
      { status: 500 }
    );
  }
}
