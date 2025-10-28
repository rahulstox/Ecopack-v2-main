import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { calculatorService } from "@/lib/co2e/calculator.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get one action log
    const log = await sql`
      SELECT * FROM ActionLog WHERE userid = ${userId} LIMIT 1;
    `;

    if (log.length === 0) {
      return NextResponse.json({ error: "No logs found" });
    }

    const action = log[0];

    // Calculate CO₂e using our service
    const calculatedCo2e = calculatorService.calculate({
      category: action.category,
      activity: action.activity,
      amount: parseFloat(action.amount),
      unit: action.unit,
    });

    // Get factor manually
    const factors = await import("@/lib/co2e/factors.json");
    const categoryFactors =
      factors.default[action.category as keyof typeof factors.default];

    return NextResponse.json({
      success: true,
      action: action,
      calculatedCo2e: calculatedCo2e,
      calculationDetails: {
        category: action.category,
        activity: action.activity,
        amount: action.amount,
        unit: action.unit,
        rawAmount: action.amount,
        unitType: action.unit,
      },
      categoryFactors: categoryFactors,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
}
