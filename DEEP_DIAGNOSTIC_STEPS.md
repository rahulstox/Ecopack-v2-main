# Deep Diagnostic - CO₂e Calculation Issue

## Run These Commands in Browser Console (F12)

### Step 1: Test Calculation Logic

```javascript
fetch("/api/debug-calc")
  .then((r) => r.json())
  .then((data) => {
    console.log("🧪 CALCULATION TEST:", data);
    console.log("📊 Calculated CO₂e:", data.calculatedCo2e);
    console.log("📋 Action Details:", data.action);
    console.log("🔢 Category Factors:", data.categoryFactors);
  });
```

### Step 2: Test Actual Database Values

```javascript
fetch("/api/action-logs")
  .then((r) => r.json())
  .then((data) => {
    const first = data.data[0];
    console.log("📊 Database Values:", {
      id: first.id,
      category: first.category,
      activity: first.activity,
      amount: first.amount,
      unit: first.unit,
      calculatedco2e: first.calculatedco2e || first.calculatedCo2e,
      loggedAt: first.loggedAt,
    });
  });
```

### Step 3: Manual Calculation Test

```javascript
// Test the calculation manually
const testCalc = {
  category: "FOOD",
  activity: "veg meal",
  amount: 150,
  unit: "G",
};

console.log("🧮 Manual Calculation:", testCalc);

// Gram to kg conversion
const adjustedAmount =
  testCalc.unit === "G" && testCalc.category === "FOOD"
    ? testCalc.amount / 1000
    : testCalc.amount;

console.log("📏 Adjusted Amount:", adjustedAmount, "kg");

// Find factor
const factor = 0.5; // VEGETABLES_KG
const result = adjustedAmount * factor;

console.log("✅ CO₂e should be:", result, "kg");
```

### Step 4: Check Recalculate Process

```javascript
fetch("/api/recalculate-actions", { method: "POST" })
  .then((r) => r.json())
  .then((data) => {
    console.log("🔄 Recalculate Result:", data);
    console.log("Updated:", data.updated);
    console.log("Errors:", data.errors);

    if (data.updated > 0) {
      console.log("✅ SUCCESS! Refreshing page...");
      setTimeout(() => location.reload(), 500);
    }
  });
```

---

## Expected Output

### Step 1 Should Show:

```javascript
calculatedCo2e: 0.075; // Should NOT be 0!
```

### Step 2 Should Show:

```javascript
calculatedco2e: 0.075; // Or undefined if not calculated yet
```

### Step 3 Should Show:

```javascript
CO₂e should be: 0.075 kg
```

### Step 4 Should Show:

```javascript
Updated: 3; // All 3 actions updated
Errors: 0;
```

---

## What Each Test Tells Us

1. **Step 1**: Tests if calculation logic works
2. **Step 2**: Shows actual database values
3. **Step 3**: Manual verification of formula
4. **Step 4**: Actually fixes the issue

**Run all 4 steps and show me the output!** 🔍
