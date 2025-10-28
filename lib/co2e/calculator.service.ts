import factors from "./factors.json";
import { UserProfileData } from "@/lib/db"; // Import the type we defined earlier
import { climateIQService } from "@/lib/climateiq"; // Import ClimateIQ service

// Type definitions for clarity
type Category = "TRANSPORT" | "FOOD" | "ENERGY" | string; // Allow string for flexibility
type Activity = string; // e.g., 'PETROL_CAR_KM', 'CHICKEN_KG'
type Unit = string; // e.g., 'KM', 'KG', 'KWH'

interface ActivityData {
  category: Category;
  activity: Activity;
  amount: number;
  unit: Unit;
}

// --- Helper Function to Get Emission Factor ---
function getEmissionFactor(
  category: Category,
  activityKey: Activity, // e.g., PETROL_CAR_KM
  userProfile?: UserProfileData // Optional user profile for personalized factors
): number {
  const categoryFactors = factors[category as keyof typeof factors];

  if (categoryFactors && typeof categoryFactors === "object") {
    // --- Personalization Logic (Example for Transport) ---
    if (category === "TRANSPORT" && userProfile?.primaryVehicleType) {
      if (activityKey.includes("CAR_KM")) {
        // Override based on user's car type if available
        if (userProfile.fuelType?.toUpperCase() === "ELECTRIC")
          return factors.TRANSPORT.EV_CAR_KM;
        if (userProfile.fuelType?.toUpperCase() === "DIESEL")
          return factors.TRANSPORT.DIESEL_CAR_KM;
        // Default to petrol if type is car but fuel unknown/other
        return factors.TRANSPORT.PETROL_CAR_KM;
      }
      // Add more personalization for other transport modes if needed
    }
    // Add similar personalization for FOOD (dietType) or ENERGY (homeEnergySource) here later

    // --- Standard Factor Lookup ---
    const factor = categoryFactors[activityKey as keyof typeof categoryFactors];
    if (typeof factor === "number") {
      return factor;
    }
  }

  console.warn(
    `Emission factor not found for ${category} -> ${activityKey}. Using default.`
  );
  return factors.DEFAULT_FACTOR; // Fallback factor
}

// --- Main Calculation Service ---
export class Co2eCalculatorService {
  calculate(activityData: ActivityData, userProfile?: UserProfileData): number {
    const { category, activity, amount, unit } = activityData;
    console.log(
      `🔍 Calculating CO₂e: ${category} / ${activity} / ${amount} ${unit}`
    );

    // Activity name mapping for common activities
    const activityMapping: Record<string, Record<string, string>> = {
      TRANSPORT: {
        "petrol car": "PETROL_CAR_KM",
        "diesel car": "DIESEL_CAR_KM",
        "electric car": "EV_CAR_KM",
        ev: "EV_CAR_KM",
        motorbike: "MOTORBIKE_KM",
        motorcycle: "MOTORBIKE_KM",
        bus: "BUS_KM",
        train: "TRAIN_KM",
        flight: "FLIGHT_SHORT_KM",
        walking: "WALKING_KM",
        cycling: "CYCLING_KM",
        car: "PETROL_CAR_KM", // Default car type
      },
      FOOD: {
        beef: "BEEF_KG",
        lamb: "LAMB_KG",
        pork: "PORK_KG",
        chicken: "CHICKEN_KG",
        fish: "FISH_FARMED_KG",
        eggs: "EGGS_DOZEN",
        milk: "MILK_LITER",
        cheese: "CHEESE_KG",
        rice: "RICE_KG",
        wheat: "WHEAT_KG",
        vegetables: "VEGETABLES_KG",
        fruits: "FRUITS_KG",
        "veg meal": "VEGETABLES_KG",
        "vegetable meal": "VEGETABLES_KG",
        oats: "WHEAT_KG",
        vegetarian: "VEGETABLES_KG",
      },
      PACKAGING: {
        plastic: "PLASTIC_PACKAGING_KG",
        cardboard: "CARDBOARD_KG",
        paper: "PAPER_KG",
        glass: "GLASS_BOTTLE_KG",
        aluminum: "ALUMINUM_CAN_KG",
        metal: "METAL_PACKAGING_KG",
        biodegradable: "BIODEGRADABLE_KG",
        reusable: "REUSABLE_KG",
      },
    };

    // Try to map activity name to standard key
    const activityLower = activity.toLowerCase().trim();
    let activityKey = `${activity
      .toUpperCase()
      .replace(/ /g, "_")}_${unit.toUpperCase()}`;

    // Check if we have a mapping for this category and activity
    const categoryMapping = activityMapping[category];
    if (categoryMapping) {
      const mappedKey = categoryMapping[activityLower];
      if (mappedKey) {
        // Check if the unit matches the factor
        const targetUnit = unit.toUpperCase();
        const mappedUnit = mappedKey.split("_").pop();

        // If units match or we need to adjust, use the mapped key
        if (mappedUnit === targetUnit || mappedUnit?.includes(targetUnit)) {
          activityKey = mappedKey;
        } else {
          // Replace unit in the key
          activityKey = mappedKey.replace(
            /_(KG|KM|KWH|LITER|DOZEN|G)$/,
            `_${targetUnit}`
          );
        }
      }
    }

    // Handle gram to kilogram conversion for food items
    let adjustedAmount = amount;
    if (unit === "G" && category === "FOOD") {
      adjustedAmount = amount / 1000; // Convert grams to kg
      console.log(
        `📏 Converted ${amount}g to ${adjustedAmount}kg for food calculation`
      );
    }

    const factor = getEmissionFactor(category, activityKey, userProfile);
    console.log(`📈 Factor found: ${factor} for key: ${activityKey}`);
    const calculatedCo2e = adjustedAmount * factor;
    console.log(
      `💾 Final CO₂e: ${calculatedCo2e} kg (${adjustedAmount} ${unit} × ${factor})`
    );

    // Round to a reasonable number of decimal places (e.g., 3)
    return Math.round(calculatedCo2e * 1000) / 1000;
  }

  // --- Specific Calculation Methods (Optional but good practice) ---

  async calculateTransport(
    activity: Activity, // e.g., 'Petrol Car', 'Bus'
    amount: number, // e.g., 10
    unit: Unit, // e.g., 'KM'
    userProfile?: UserProfileData
  ): Promise<number> {
    // Try ClimateIQ for accurate calculations
    try {
      const result = await climateIQService.calculateEmission({
        category: "transport",
        activity,
        amount,
        unit,
      });
      return result.co2e;
    } catch (error) {
      // Fallback to local calculation
      return this.calculate(
        { category: "TRANSPORT", activity, amount, unit },
        userProfile
      );
    }
  }

  async calculateFood(
    activity: Activity, // e.g., 'Chicken', 'Beef'
    amount: number, // e.g., 200
    unit: Unit, // e.g., 'G' -> needs conversion to KG
    userProfile?: UserProfileData
  ): Promise<number> {
    // Try ClimateIQ for accurate food emissions
    try {
      const result = await climateIQService.calculateEmission({
        category: "food",
        activity,
        amount,
        unit,
      });
      console.log(
        `✅ ClimateIQ calculated ${activity}: ${result.co2e} kg CO₂e`
      );
      return result.co2e;
    } catch (error) {
      console.log(
        `⚠️ ClimateIQ failed for ${activity}, using local calculation`
      );
      // Fallback to local calculation with unit conversion
      let calculationAmount = amount;
      let calculationUnit = unit.toUpperCase();
      let calculationActivity = activity;

      // Convert grams to kilograms for food items
      if (unit.toUpperCase() === "G") {
        calculationAmount = amount / 1000; // Convert grams to kg
        calculationUnit = "KG";
      }

      // Map activity name for better matching
      const foodMapping: Record<string, string> = {
        "veg meal": "vegetables",
        "vegetable meal": "vegetables",
        "vegetarian meal": "vegetables",
        oats: "wheat",
      };

      const mappedFood = foodMapping[calculationActivity.toLowerCase()];
      if (mappedFood) {
        calculationActivity = mappedFood;
      }

      const co2e = this.calculate(
        {
          category: "FOOD",
          activity: calculationActivity,
          amount: calculationAmount,
          unit: calculationUnit,
        },
        userProfile
      );
      console.log(
        `📊 Local calculation for ${calculationActivity}: ${co2e} kg CO₂e (${calculationAmount} ${calculationUnit})`
      );
      return co2e;
    }
  }

  async calculateEnergy(
    activity: Activity, // e.g., 'Grid Mix', 'Natural Gas'
    amount: number, // e.g., 50
    unit: Unit, // e.g., 'KWH'
    userProfile?: UserProfileData
  ): Promise<number> {
    try {
      const result = await climateIQService.calculateEmission({
        category: "energy",
        activity,
        amount,
        unit,
      });
      return result.co2e;
    } catch (error) {
      return this.calculate(
        { category: "ENERGY", activity, amount, unit },
        userProfile
      );
    }
  }

  async calculatePackaging(
    activity: Activity,
    amount: number,
    unit: Unit,
    userProfile?: UserProfileData
  ): Promise<number> {
    try {
      const result = await climateIQService.calculateEmission({
        category: "packaging",
        activity,
        amount,
        unit,
      });
      return result.co2e;
    } catch (error) {
      return this.calculate(
        { category: "PACKAGING", activity, amount, unit },
        userProfile
      );
    }
  }
}

// Export a singleton instance for easy use
export const calculatorService = new Co2eCalculatorService();
