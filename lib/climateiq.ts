/**
 * ClimateIQ API Integration
 * Provides accurate CO₂e calculations using verified emission factors
 *
 * API Reference: https://api.climateiq.com
 */

interface EmissionRequest {
  category: "transport" | "food" | "energy" | "waste" | "packaging";
  activity: string;
  amount: number;
  unit: string;
  region?: string;
  additionalData?: Record<string, any>;
}

interface EmissionResponse {
  co2e: number;
  category: string;
  activity: string;
  emissionFactor: number;
  unit: string;
  timestamp: string;
  dataSource: string;
}

export class ClimateIQService {
  private apiKey: string;
  private baseUrl: string = "https://api.climateiq.com";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.CLIMATEIQ_API_KEY || "";
  }

  /**
   * Calculate CO₂e using ClimateIQ API with verified factors
   */
  async calculateEmission(request: EmissionRequest): Promise<EmissionResponse> {
    // If API key is not available, fall back to local calculations
    if (!this.apiKey) {
      console.log("⚠️ ClimateIQ API key not found, using local calculations");
      return this.calculateLocal(request);
    }

    try {
      console.log(
        `🌐 Attempting ClimateIQ API call for: ${request.category} - ${request.activity}`
      );
      const response = await fetch(`${this.baseUrl}/v1/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          ...request,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`ClimateIQ API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ ClimateIQ API response:`, data);
      return data;
    } catch (error) {
      console.error("❌ ClimateIQ API error:", error);
      console.log("🔄 Falling back to local calculation");
      // Fallback to local calculation
      return this.calculateLocal(request);
    }
  }

  /**
   * Fallback local calculation with verified emission factors
   */
  private calculateLocal(request: EmissionRequest): EmissionResponse {
    const { category, activity, amount, unit } = request;
    console.log(
      `🔧 ClimateIQ local calculation: ${category} - ${activity} - ${amount} ${unit}`
    );

    let emissionFactor = 0;
    let standardUnit = unit.toLowerCase();

    // Convert units to standard (e.g., g -> kg)
    let amountInStandardUnit = amount;
    if (standardUnit === "g") {
      amountInStandardUnit = amount / 1000;
      standardUnit = "kg";
      console.log(`📏 Converted ${amount}g to ${amountInStandardUnit}kg`);
    }

    // Get emission factor based on category
    switch (category) {
      case "transport":
        emissionFactor = this.getTransportFactor(activity, standardUnit);
        break;
      case "food":
        emissionFactor = this.getFoodFactor(activity, standardUnit);
        break;
      case "energy":
        emissionFactor = this.getEnergyFactor(activity, standardUnit);
        break;
      case "waste":
        emissionFactor = this.getWasteFactor(activity, standardUnit);
        break;
      case "packaging":
        emissionFactor = this.getPackagingFactor(activity, standardUnit);
        break;
    }

    const co2e = amountInStandardUnit * emissionFactor;
    console.log(
      `🧮 Calculation: ${amountInStandardUnit} ${standardUnit} × ${emissionFactor} = ${co2e.toFixed(
        3
      )} kg CO₂e`
    );

    return {
      co2e: Number(co2e.toFixed(3)),
      category,
      activity,
      emissionFactor,
      unit: standardUnit,
      timestamp: new Date().toISOString(),
      dataSource: "local-factors",
    };
  }

  private getTransportFactor(activity: string, unit: string): number {
    // kg CO₂e per km for transport
    const factors: Record<string, number> = {
      car: 0.171,
      "petrol car": 0.171,
      "diesel car": 0.195,
      "electric car": 0.048,
      ev: 0.048,
      "hybrid car": 0.12,
      motorbike: 0.099,
      bus: 0.085,
      train: 0.038,
      flight: 0.255,
      walking: 0,
      cycling: 0,
    };

    const activityLower = activity.toLowerCase().trim();
    console.log(`🚗 Looking up transport factor for: "${activityLower}"`);

    // Try exact match first
    if (factors[activityLower]) {
      console.log(`✅ Exact match found: ${factors[activityLower]}`);
      return factors[activityLower];
    }

    // Try partial match
    for (const [key, value] of Object.entries(factors)) {
      if (activityLower.includes(key)) {
        console.log(`✅ Partial match found for "${key}": ${value}`);
        return value;
      }
    }

    console.log(`⚠️ No match found, using default: 0.15`);
    return 0.15; // Default for unknown transport
  }

  private getFoodFactor(activity: string, unit: string): number {
    // kg CO₂e per kg for food items
    const factors: Record<string, number> = {
      beef: 27.0,
      lamb: 24.0,
      pork: 7.0,
      chicken: 6.0,
      fish: 4.0,
      eggs: 2.3,
      milk: 1.9,
      cheese: 13.5,
      rice: 2.5,
      wheat: 0.8,
      oats: 0.8,
      vegetables: 0.5,
      "veg meal": 0.5,
      vegetarian: 0.5,
      meal: 3.0, // Default mixed meal
      fruits: 0.7,
      bread: 0.8,
      potato: 0.5,
    };

    const activityLower = activity.toLowerCase().trim();
    console.log(`🍽️ Looking up food factor for: "${activityLower}"`);

    // Try exact match first
    if (factors[activityLower]) {
      console.log(`✅ Exact match found: ${factors[activityLower]}`);
      return factors[activityLower];
    }

    // Try partial match
    for (const [key, value] of Object.entries(factors)) {
      if (activityLower.includes(key)) {
        console.log(`✅ Partial match found for "${key}": ${value}`);
        return value;
      }
    }

    console.log(`⚠️ No match found, using default: 2.0`);
    return 2.0; // Default for unknown food items
  }

  private getEnergyFactor(activity: string, unit: string): number {
    // kg CO₂e per kWh
    const factors: Record<string, number> = {
      "grid coal": 0.95,
      "grid mix": 0.45,
      grid: 0.45,
      renewables: 0.05,
      solar: 0.02,
      wind: 0.012,
      "natural gas": 0.2,
      lpg: 0.23,
      electricity: 0.45,
    };

    const activityLower = activity.toLowerCase();
    for (const [key, value] of Object.entries(factors)) {
      if (activityLower.includes(key)) {
        return value;
      }
    }
    return 0.45; // Default grid mix
  }

  private getWasteFactor(activity: string, unit: string): number {
    // kg CO₂e per kg of waste
    const factors: Record<string, number> = {
      plastic: 3.0,
      paper: 0.2,
      glass: 0.6,
      metal: 2.5,
      organic: 0.5,
      electronic: 10.0,
      landfill: 0.5,
    };

    const activityLower = activity.toLowerCase();
    for (const [key, value] of Object.entries(factors)) {
      if (activityLower.includes(key)) {
        return value;
      }
    }
    return 1.0; // Default for unknown waste
  }

  private getPackagingFactor(activity: string, unit: string): number {
    // kg CO₂e per kg of packaging material
    const factors: Record<string, number> = {
      "plastic packaging": 3.5,
      cardboard: 0.8,
      paper: 0.4,
      "glass bottle": 1.2,
      "aluminum can": 2.4,
      "metal packaging": 2.5,
      biodegradable: 0.3,
      "recycled plastic": 1.5,
      "recycled cardboard": 0.4,
      "eco-friendly": 0.5,
      "single-use plastic": 4.0,
      reusable: 0.1,
    };

    const activityLower = activity.toLowerCase();
    for (const [key, value] of Object.entries(factors)) {
      if (activityLower.includes(key)) {
        return value;
      }
    }
    return 2.0; // Default for unknown packaging
  }
}

// Export singleton instance
export const climateIQService = new ClimateIQService();
