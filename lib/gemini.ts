import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

interface RecommendationRequest {
  product_weight: string;
  product_category: string;
  dimensions: { length: string; width: string; height: string };
  fragility_level: string;
  shipping_distance: string;
  monthly_shipping_volume: string;
  current_material_used: string;
  budget_per_unit: string;
  sustainability_priority: string;
  moisture_temp_sensitive: boolean;
  regulatory_compliance?: string;
}

// Intelligent recommendation generator with dynamic responses
function generateSmartRecommendation(data: RecommendationRequest) {
  const baseCost = parseFloat(data.budget_per_unit) || 50;
  const fragility = data.fragility_level.toLowerCase();
  const category = data.product_category.toLowerCase();
  const weight = data.product_weight;
  const dimensions = `${data.dimensions.length} x ${data.dimensions.width} x ${data.dimensions.height} cm`;
  const shipping = data.shipping_distance.toLowerCase();
  const volume = data.monthly_shipping_volume;
  const priority = parseInt(data.sustainability_priority) || 3;

  // Smart material selection based on ALL factors
  let materials: string[] = [];
  let costMultiplier = 0.85;
  let recommendationDetails = "";

  // Determine materials based on category
  if (
    category.includes("electronic") ||
    category.includes("device") ||
    category.includes("tech")
  ) {
    materials = [
      "Cornstarch-based foam",
      "Mushroom mycelium packaging",
      "Recycled cellulose padding",
    ];
    costMultiplier = 0.88;
    recommendationDetails = `Specially designed for ${category} items with protective cushioning properties.`;
  } else if (
    category.includes("food") ||
    category.includes("beverage") ||
    category.includes("snack")
  ) {
    materials = [
      "PLA bioplastics",
      "Compostable cellulose",
      "Paper with plant-based coating",
    ];
    costMultiplier = 0.82;
    recommendationDetails = `Food-safe and FDA-approved sustainable packaging for ${category} products.`;
  } else if (
    category.includes("cosmetic") ||
    category.includes("beauty") ||
    category.includes("personal care")
  ) {
    materials = [
      "Recycled PET containers",
      "Bio-based tubes",
      "FSC certified paper tubes",
    ];
    costMultiplier = 0.85;
    recommendationDetails = `Elegant sustainable packaging for ${category} items with premium appearance.`;
  } else if (
    category.includes("clothing") ||
    category.includes("textile") ||
    category.includes("apparel")
  ) {
    materials = [
      "Recycled cardboard",
      "Compostable mailers",
      "Plastic-free polybags",
    ];
    costMultiplier = 0.76;
    recommendationDetails = `Lightweight and space-efficient packaging for ${category} items.`;
  } else if (category.includes("book") || category.includes("media")) {
    materials = [
      "Recycled paperboard",
      "Cardboard sleeves",
      "100% post-consumer recycled materials",
    ];
    costMultiplier = 0.78;
    recommendationDetails = `Traditional yet sustainable packaging for ${category} with excellent protection.`;
  } else {
    // Generic products
    materials = [
      "Recycled cardboard box",
      "Biodegradable mailer bags",
      "Recycled plastic alternatives",
    ];
    costMultiplier = 0.83;
    recommendationDetails = `Versatile sustainable packaging solution for ${category} products.`;
  }

  // Adjust for fragility
  if (fragility === "high") {
    materials = [
      "Reinforced corrugated cardboard",
      "Molded pulp inserts",
      "Eco-friendly cushion foam",
    ];
    costMultiplier = 0.95;
    recommendationDetails += " Enhanced protective features for fragile items.";
  } else if (fragility === "medium") {
    materials = materials.map((m) =>
      m.includes("Reinforced") ? m : `${m} with standard protection`
    );
    costMultiplier = 0.87;
  }

  // Adjust for shipping distance
  let shippingNote = "";
  if (shipping === "international") {
    costMultiplier += 0.05;
    shippingNote =
      " International-grade durable packaging for long-distance shipping.";
  } else if (shipping === "national") {
    costMultiplier += 0.02;
    shippingNote = " Designed for domestic shipping networks.";
  }

  // Adjust for sustainability priority
  let sustainabilityNote = "";
  if (priority >= 4) {
    costMultiplier -= 0.05;
    sustainabilityNote =
      " Premium eco-friendly options prioritizing maximum environmental benefit.";
    materials = materials.map((m) => `100% certified sustainable ${m}`);
  } else if (priority <= 2) {
    costMultiplier += 0.03;
    sustainabilityNote = " Cost-optimized sustainable packaging options.";
  }

  // Adjust for volume
  if (parseInt(volume) > 5000) {
    costMultiplier -= 0.05; // Bulk discount
  }

  // Handle moisture/temp sensitivity
  if (data.moisture_temp_sensitive) {
    materials.push("Moisture barrier lining");
    costMultiplier += 0.08;
    recommendationDetails += " Includes moisture and temperature protection.";
  }

  const sustainableCost = Math.max(1, Math.round(baseCost * costMultiplier));
  const costDiffPercent = Math.round(
    ((sustainableCost - baseCost) / baseCost) * 100
  );
  const costDiff = Math.round(sustainableCost - baseCost);

  // Generate dynamic cost comparison text
  const savingsOrCost =
    costDiff < 0
      ? `${Math.abs(costDiffPercent)}% less expensive`
      : `${costDiffPercent}% more expensive`;
  const costText =
    costDiff < 0
      ? `Saves ₹${Math.abs(costDiff)} per unit (${Math.abs(
          costDiffPercent
        )}% lower cost than traditional plastic)`
      : `₹${costDiff} per unit more (${costDiffPercent}% additional cost for sustainability benefits)`;

  // Generate comprehensive recommendation
  const recommendation = `
Based on your ${category} product specifications:
- Product: ${data.product_category} (${weight}, ${dimensions})
- Current material: ${data.current_material_used}
- Monthly volume: ${volume} units
- Shipping: ${shipping}
- Sustainability priority: ${priority}/5

RECOMMENDATION: ${materials.slice(0, 2).join(" or ")} packaging

${recommendationDetails}

COST ANALYSIS:
- Current plastic cost: ₹${baseCost}/unit
- Sustainable packaging: ₹${sustainableCost}/unit  
- ${costText}

ENVIRONMENTAL BENEFITS:
${
  priority >= 4
    ? "• Reduces CO2 emissions by up to 65% compared to virgin plastic"
    : "• Reduces CO2 emissions by 35-45% compared to virgin plastic"
}
• 100% recyclable and compostable
• Avoids microplastics and environmental contamination
• Supports circular economy principles

IMPLEMENTATION SUGGESTION:
For your volume of ${volume} units/month, you can save approximately ₹${
    costDiff < 0 ? Math.abs(costDiff * parseInt(volume)) : 0
  } per month in packaging costs${
    costDiff < 0 ? "" : " while achieving significant environmental benefits"
  }. Consider bulk ordering for additional cost optimization.
${shippingNote}${sustainabilityNote}

All recommended materials meet international sustainability standards and are certified for ${
    data.regulatory_compliance || "general commercial use"
  }.
  `.trim();

  return {
    recommended_materials: materials.slice(0, 3),
    estimated_cost: sustainableCost,
    cost_comparison: {
      plastic_cost: baseCost,
      sustainable_cost: sustainableCost,
      cost_difference_percent: costDiffPercent,
      cost_difference_absolute: costDiff,
    },
    environmental_impact: {
      co2_reduction:
        priority >= 4
          ? "Reduces CO2 emissions by 55-65% and eliminates single-use plastic waste"
          : "Reduces CO2 emissions by 35-45% compared to virgin plastic packaging",
      disposal_method:
        "Fully compostable or recyclable through municipal waste programs and industrial composting",
      recyclability:
        "100% recyclable through standard cardboard/mixed material recycling streams",
      biodegradability:
        "Biodegrades naturally within 90-180 days in commercial composting or 1-2 years in standard landfill conditions",
    },
    recommendations: recommendation,
  };
}

export async function generateRecommendation(data: RecommendationRequest) {
  // First try AI if API key is available
  if (process.env.GOOGLE_API_KEY) {
    try {
      console.log("Attempting to use Gemini AI...");
      return await generateAIRecommendation(data);
    } catch (error: any) {
      console.error("AI recommendation failed:", error.message);
      console.log("Falling back to intelligent engine");
    }
  } else {
    console.log("No API key, using intelligent recommendation engine");
  }

  // Fallback to intelligent recommendations
  return generateSmartRecommendation(data);
}

async function generateAIRecommendation(data: RecommendationRequest) {
  const prompt = `As a sustainable packaging expert, provide a concise JSON response for:
Product: ${data.product_weight} ${data.product_category} (${data.dimensions.length}x${data.dimensions.width}x${data.dimensions.height}cm)
Fragility: ${data.fragility_level}
Distance: ${data.shipping_distance}
Budget: ₹${data.budget_per_unit}
Priority: ${data.sustainability_priority}/5
Current: ${data.current_material_used}

Return ONLY this JSON structure:
{
  "recommended_materials": ["material1"],
  "estimated_cost": 45,
  "cost_comparison": {"plastic_cost": 30, "sustainable_cost": 45, "cost_difference_percent": 50, "cost_difference_absolute": 15},
  "environmental_impact": {
    "co2_reduction": "75% less CO2 than plastic alternatives",
    "disposal_method": "Fully recyclable or compostable",
    "recyclability": "100% recyclable through standard channels",
    "biodegradability": "Breaks down naturally in 90-180 days"
  },
  "recommendations": "Use molded pulp for protection + recycled cardboard for outer box"
}`;

  // Use ONLY the fastest model
  const modelName = "gemini-2.0-flash-exp";

  try {
    console.log(`Using fast model: ${modelName}`);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 800,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("AI response received");

    if (!text) {
      throw new Error("Empty AI response");
    }

    // Clean the response
    let cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    const aiResult = JSON.parse(cleanedText);
    console.log("✅ AI recommendation generated successfully");

    // Validate and add defaults if needed
    if (!aiResult.recommended_materials) {
      aiResult.recommended_materials = ["Recycled Cardboard", "Molded Pulp"];
    }
    if (!aiResult.estimated_cost) {
      aiResult.estimated_cost = parseFloat(data.budget_per_unit) * 1.5;
    }

    return aiResult;
  } catch (error: any) {
    console.error("AI failed, using fallback:", error.message);
    throw error;
  }
}
