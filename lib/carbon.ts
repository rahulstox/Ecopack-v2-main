interface CarbonFactors {
  material_weight: number;
  material_type: string;
  shipping_distance: string;
  fragility_level: string;
}

interface EmissionFactors {
  [key: string]: number;
}

const MATERIAL_EMISSION_FACTORS: EmissionFactors = {
  plastic: 2.5,
  cardboard: 0.5,
  paper: 0.8,
  glass: 1.2,
  aluminum: 6.0,
  bioplastic: 1.0,
  mushroom: 0.3,
  bamboo: 0.4,
  hemp: 0.5,
};

const TRANSPORT_FACTORS: EmissionFactors = {
  local: 0.1,
  national: 0.5,
  international: 2.0,
};

const DISPOSAL_FACTORS: EmissionFactors = {
  recyclable: -0.3,
  biodegradable: 0.0,
  non_recyclable: 0.5,
};

export function calculateCarbonFootprint(factors: CarbonFactors) {
  const { material_weight, material_type, shipping_distance, fragility_level } = factors;

  // Material emissions (convert to kg for consistency)
  const materialFactor = MATERIAL_EMISSION_FACTORS[material_type.toLowerCase()] || 1.0;
  const materialEmissions = (material_weight / 1000) * materialFactor;

  // Transport emissions
  const transportFactor = TRANSPORT_FACTORS[shipping_distance] || 0.5;
  const transportEmissions = transportFactor * (material_weight / 1000);

  // Disposal emissions (assuming recyclable by default for sustainable materials)
  const disposalFactor = fragility_level === 'High' ? 0.2 : 0.1;
  const disposalEmissions = materialEmissions * disposalFactor;

  // Total carbon footprint (in CO2 kg equivalent)
  const totalCarbon = materialEmissions + transportEmissions + disposalEmissions;

  // Convert to carbon score (0-100, lower is better)
  // Normalize based on weight and typical benchmarks
  const baseScore = Math.min(100, (totalCarbon / (material_weight / 100)) * 10);
  const carbonScore = Math.max(0, Math.min(100, baseScore));

  // Calculate percentage breakdown
  const breakdown = {
    material: (materialEmissions / totalCarbon) * 100,
    transport: (transportEmissions / totalCarbon) * 100,
    disposal: (disposalEmissions / totalCarbon) * 100,
  };

  // Suggestions
  const suggestions = generateSuggestions(totalCarbon, material_type, shipping_distance);

  return {
    total_carbon_score: Math.round(carbonScore),
    emission_breakdown: {
      material: Math.round(breakdown.material),
      transport: Math.round(breakdown.transport),
      disposal: Math.round(breakdown.disposal),
    },
    total_kg_co2: Math.round(totalCarbon * 100) / 100,
    suggestions,
  };
}

function generateSuggestions(
  totalCarbon: number,
  materialType: string,
  shippingDistance: string
): string[] {
  const suggestions: string[] = [];

  if (totalCarbon > 5) {
    suggestions.push('Consider lighter-weight alternatives');
  }

  if (shippingDistance === 'international' && totalCarbon > 3) {
    suggestions.push('Optimize packaging dimensions to reduce volumetric weight');
  }

  if (materialType === 'plastic') {
    suggestions.push('Explore biodegradable or recyclable material alternatives');
  }

  if (totalCarbon > 10) {
    suggestions.push('Consider reducing packaging size or eliminating unnecessary layers');
  }

  suggestions.push('Source materials from local suppliers to reduce transport emissions');

  return suggestions.slice(0, 3);
}

