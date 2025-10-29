import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { insertActionLog, getUserProfile } from "@/lib/db";
import { calculatorService } from "@/lib/co2e/calculator.service";
import { ActionLogData } from "@/lib/db";

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
    const { category, activity, amount, unit } = body;

    // Validate required fields
    if (!category || !activity || amount === undefined || !unit) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user profile for personalization
    const userProfile = await getUserProfile(userId);

    // Calculate CO₂e using ClimateIQ
    let calculatedCo2e = 0;

    if (category === "TRANSPORT") {
      calculatedCo2e = await calculatorService.calculateTransport(
        activity,
        amount,
        unit,
        userProfile
      );
    } else if (category === "FOOD") {
      calculatedCo2e = await calculatorService.calculateFood(
        activity,
        amount,
        unit,
        userProfile
      );
    } else if (category === "ENERGY") {
      calculatedCo2e = await calculatorService.calculateEnergy(
        activity,
        amount,
        unit,
        userProfile
      );
    } else if (category === "PACKAGING") {
      calculatedCo2e = await calculatorService.calculatePackaging(
        activity,
        amount,
        unit,
        userProfile
      );
    } else {
      // Generic calculation
      calculatedCo2e = calculatorService.calculate(
        { category, activity, amount, unit },
        userProfile
      );
    }

    // Save to database
    const actionLogData: ActionLogData = {
      userId,
      category,
      activity,
      amount,
      unit,
      calculatedCo2e,
    };

    const result = await insertActionLog(actionLogData);

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        category,
        activity,
        amount,
        unit,
        calculatedCo2e,
      },
    });
  } catch (error: any) {
    console.error("❌ API /api/log-action Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to log action" },
      { status: 500 }
    );
  }
}
