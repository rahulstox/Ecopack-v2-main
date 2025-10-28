import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getActionLogsByUserId, sql } from "@/lib/db";
import { calculatorService } from "@/lib/co2e/calculator.service";

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

    // Get all logs
    const allLogs = await getActionLogsByUserId(userId, 1000, 0);

    console.log(`🔄 Recalculating for user ${userId}`);
    console.log(`📊 Found ${allLogs.length} action logs`);

    if (allLogs.length === 0) {
      return NextResponse.json({
        success: false,
        message: `No actions found for user ${userId}`,
        updated: 0,
        errors: 0,
      });
    }

    let updated = 0;
    let errors = 0;

    for (const log of allLogs) {
      try {
        console.log(
          `📝 Processing log ${log.id}: ${log.category} - ${log.activity}`
        );
        let calculatedCo2e = 0;

        if (log.category === "TRANSPORT") {
          calculatedCo2e = await calculatorService.calculateTransport(
            log.activity,
            log.amount,
            log.unit
          );
        } else if (log.category === "FOOD") {
          // Use direct calculate method instead of async calculateFood
          // to avoid ClimateIQ API issues
          calculatedCo2e = calculatorService.calculate({
            category: log.category,
            activity: log.activity,
            amount: parseFloat(log.amount),
            unit: log.unit,
          });
        } else if (log.category === "ENERGY") {
          calculatedCo2e = await calculatorService.calculateEnergy(
            log.activity,
            log.amount,
            log.unit
          );
        } else if (log.category === "PACKAGING") {
          calculatedCo2e = await calculatorService.calculatePackaging(
            log.activity,
            log.amount,
            log.unit
          );
        } else {
          calculatedCo2e = calculatorService.calculate({
            category: log.category,
            activity: log.activity,
            amount: log.amount,
            unit: log.unit,
          });
        }

        console.log(
          `✅ Calculated CO₂e for log ${log.id}: ${calculatedCo2e} kg`
        );

        // Update the database with lowercase column name
        await sql`
          UPDATE ActionLog 
          SET calculatedco2e = ${calculatedCo2e}
          WHERE id = ${log.id}
        `;

        updated++;
      } catch (error) {
        console.error(`❌ Error updating log ${log.id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Recalculated ${updated} actions. ${errors} errors.`,
      updated,
      errors,
    });
  } catch (error: any) {
    console.error("❌ API /api/recalculate-actions Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to recalculate",
      },
      { status: 500 }
    );
  }
}
