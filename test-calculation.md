# Test CO₂e Calculation

## Expected Behavior

When logging:

- **Category:** FOOD
- **Activity:** veg meal
- **Amount:** 150
- **Unit:** G (grams)

Should use: **VEGETABLES_KG** factor = 0.5 kg CO₂e per kg

Conversion: 150g = 0.15kg
CO₂e = 0.15 × 0.5 = **0.075 kg CO₂e**

## Current Issue

Activity "veg meal" should map to:

```javascript
"veg meal" → "VEGETABLES_KG"
```

But it's showing **0.000** kg CO₂e

## Fix Needed

The issue is likely in the unit conversion or the factor lookup. Let's check the calculation flow.
