import { NextRequest, NextResponse } from "next/server";
import { generateRecommendation } from "@/lib/gemini";
import { calculateCarbonFootprint } from "@/lib/carbon";
import { insertRecommendation } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Generate AI recommendation
    const aiOutput = await generateRecommendation(formData);

    // Calculate carbon footprint
    const weight = parseFloat(formData.product_weight);
    const carbonData = calculateCarbonFootprint({
      material_weight: weight,
      material_type: aiOutput.recommended_materials[0] || "cardboard",
      shipping_distance: formData.shipping_distance,
      fragility_level: formData.fragility_level,
    });

    // Combine AI output with carbon data
    const completeOutput = {
      ...aiOutput,
      carbon_footprint: carbonData,
    };

    // Get userId from auth
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();

    // Store in database
    const savedRecord = await insertRecommendation({
      userid: userId || "anonymous",
      form_input: formData,
      ai_output: completeOutput,
      carbon_score: carbonData.total_carbon_score,
    });

    return NextResponse.json({
      success: true,
      data: completeOutput,
      id: savedRecord[0].id,
    });
  } catch (error: any) {
    console.error("Recommendation error:", error);
    const errorMessage = error?.message || "Failed to generate recommendation";
    return NextResponse.json(
      { success: false, error: errorMessage, details: error?.toString() },
      { status: 500 }
    );
  }
}
