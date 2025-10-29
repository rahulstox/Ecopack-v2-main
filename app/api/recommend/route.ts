import { NextRequest, NextResponse } from "next/server";
import { generateRecommendation } from "@/lib/gemini";
import { calculateCarbonFootprint } from "@/lib/carbon";
import { insertRecommendation } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const formData = await request.json();

    // Generate AI recommendation and measure processing time
    const aiProcessingStart = Date.now();
    const aiOutput = await generateRecommendation(formData);
    const aiProcessingTime = ((Date.now() - aiProcessingStart) / 1000).toFixed(
      2
    );

    // Calculate carbon footprint
    const weight = parseFloat(formData.product_weight);
    const carbonData = calculateCarbonFootprint({
      material_weight: weight,
      material_type: aiOutput.recommended_materials[0] || "cardboard",
      shipping_distance: formData.shipping_distance,
      fragility_level: formData.fragility_level,
    });

    // Combine AI output with carbon data and processing time
    const completeOutput = {
      ...aiOutput,
      carbon_footprint: carbonData,
      processing_time: {
        ai_processing: parseFloat(aiProcessingTime),
        total_processing: 0, // Will be set after DB insertion
      },
    };

    // Get userId from auth
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();

    // Calculate total processing time before storing
    const totalProcessingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    completeOutput.processing_time.total_processing =
      parseFloat(totalProcessingTime);

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
      processing_time: {
        ai_processing: parseFloat(aiProcessingTime),
        total_processing: parseFloat(totalProcessingTime),
      },
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
