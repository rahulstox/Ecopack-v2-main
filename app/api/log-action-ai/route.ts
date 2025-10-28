import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { insertActionLog, getUserProfile } from "@/lib/db";
import { calculatorService } from "@/lib/co2e/calculator.service";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

interface ParsedActivity {
  category: string;
  activity: string;
  amount: number;
  unit: string;
}

interface ParsedActivities {
  activities: ParsedActivity[];
}

async function parseActivityWithAI(
  rawInput: string
): Promise<ParsedActivity[]> {
  const prompt = `Parse this activity description and extract ALL activities as structured data in JSON format.

Description: "${rawInput}"

IMPORTANT: If the description contains multiple activities, extract EACH ONE as a separate entry.

Return ONLY valid JSON with this exact structure (no markdown):
{
  "activities": [
    {
      "category": "TRANSPORT" | "FOOD" | "ENERGY" | "PACKAGING" | "WASTE",
      "activity": "descriptive activity name",
      "amount": <number>,
      "unit": "KM" | "KG" | "G" | "KWH" | "L" | "DOZEN" | "LITER"
    }
  ]
}

Examples:
- "I drove 15 km to work" → {"activities":[{"category":"TRANSPORT","activity":"Petrol Car","amount":15,"unit":"KM"}]}
- "I drove 15 km today and ate 250g oats" → {"activities":[{"category":"TRANSPORT","activity":"Petrol Car","amount":15,"unit":"KM"},{"category":"FOOD","activity":"Oats","amount":250,"unit":"G"}]}
- "I used 5 kWh of electricity and 2 kg plastic packaging" → {"activities":[{"category":"ENERGY","activity":"Grid Mix","amount":5,"unit":"KWH"},{"category":"PACKAGING","activity":"Plastic Packaging","amount":2,"unit":"KG"}]}

Guidelines:
- Extract multiple activities from complex descriptions
- Convert units (g to G, km to KM, etc.)
- Be accurate with category classification`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean and parse JSON response
    let cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    const parsed = JSON.parse(cleanedText);

    // Handle both single activity and multiple activities
    const activities: ParsedActivity[] = parsed.activities || [parsed];

    // Validate all activities
    const validActivities = activities.filter((activity: ParsedActivity) => {
      return (
        activity.category &&
        activity.activity &&
        activity.amount &&
        activity.unit
      );
    });

    if (validActivities.length === 0) {
      throw new Error("No valid activities found in parsed data");
    }

    return validActivities;
  } catch (error) {
    console.error("AI parsing error:", error);
    throw new Error("Failed to parse activity with AI");
  }
}

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
    const { rawInput } = body;

    if (!rawInput || typeof rawInput !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid rawInput" },
        { status: 400 }
      );
    }

    // Parse activities using AI (handles multiple activities)
    const parsedActivities = await parseActivityWithAI(rawInput);

    // Get user profile for personalization
    const userProfile = await getUserProfile(userId);

    const results = [];

    // Process each activity
    for (const activity of parsedActivities) {
      // Calculate CO₂e
      let calculatedCo2e = 0;

      if (activity.category === "TRANSPORT") {
        calculatedCo2e = await calculatorService.calculateTransport(
          activity.activity,
          activity.amount,
          activity.unit,
          userProfile
        );
      } else if (activity.category === "FOOD") {
        calculatedCo2e = await calculatorService.calculateFood(
          activity.activity,
          activity.amount,
          activity.unit,
          userProfile
        );
      } else if (activity.category === "ENERGY") {
        calculatedCo2e = await calculatorService.calculateEnergy(
          activity.activity,
          activity.amount,
          activity.unit,
          userProfile
        );
      } else if (activity.category === "PACKAGING") {
        calculatedCo2e = await calculatorService.calculatePackaging(
          activity.activity,
          activity.amount,
          activity.unit,
          userProfile
        );
      } else {
        calculatedCo2e = calculatorService.calculate(
          {
            category: activity.category,
            activity: activity.activity,
            amount: activity.amount,
            unit: activity.unit,
          },
          userProfile
        );
      }

      // Save to database
      const result = await insertActionLog({
        userId,
        category: activity.category,
        activity: activity.activity,
        amount: activity.amount,
        unit: activity.unit,
        calculatedCo2e,
        rawInput, // Store the original input
      });

      results.push({
        id: result.id,
        category: activity.category,
        activity: activity.activity,
        amount: activity.amount,
        unit: activity.unit,
        calculatedCo2e,
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: `Successfully logged ${results.length} activity${
        results.length > 1 ? "ies" : "y"
      }`,
    });
  } catch (error: any) {
    console.error("❌ API /api/log-action-ai Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process AI request",
      },
      { status: 500 }
    );
  }
}
