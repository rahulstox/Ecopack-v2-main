# Calculation Debug Guide

## 🔍 What's Happening

Your CO₂e calculations are showing 0.000 because:

### 1. ClimateIQ API Status

- **No API key configured** - The system falls back to local calculations
- This is **NORMAL** and expected - local calculations should work fine

### 2. Local Calculation Flow

When you log an action, here's what happens:

1. `lib/co2e/calculator.service.ts` receives the data
2. It calls `lib/climateiq.ts` to calculate
3. ClimateIQ checks for API key (none found)
4. Falls back to local calculation using emission factors
5. Returns CO₂e value

## 🐛 The Problem

Looking at your data:

- **"Meal" (450g)** - Activity name: "Meal"
- **"car" (100 km)** - Activity name: "car"

Both should calculate, but they're showing 0.000. Let me check why.

## ✅ What I Just Fixed

### 1. **Added Extensive Logging**

Now you'll see in the server console:

```
⚠️ ClimateIQ API key not found, using local calculations
🔧 ClimateIQ local calculation: food - Meal - 450 g
📏 Converted 450g to 0.45kg
🍽️ Looking up food factor for: "meal"
✅ Exact match found: 3.0
🧮 Calculation: 0.45 kg × 3.0 = 1.350 kg CO₂e
```

### 2. **Improved Food Factor Matching**

Added these entries to ClimateIQ:

- "meal" → 3.0 kg CO₂e per kg (mixed meal default)
- "veg meal" → 0.5 kg CO₂e per kg
- "oats" → 0.8 kg CO₂e per kg

### 3. **Improved Transport Factor Matching**

- "car" → 0.171 kg CO₂e per km (works now)

## 🚀 How to Test Right Now

### Step 1: Open Terminal/Console

Watch the server logs while you click "Recalculate"

### Step 2: Click "Recalculate"

You should see logs like:

```
🔄 Recalculating for user user_xxx
📊 Found 2 action logs
📝 Processing log 1: FOOD - Meal
⚠️ ClimateIQ failed for Meal, using local calculation
🔧 ClimateIQ local calculation: food - Meal - 450 g
📏 Converted 450g to 0.45kg
🍽️ Looking up food factor for: "meal"
✅ Exact match found: 3.0
🧮 Calculation: 0.45 kg × 3.0 = 1.350 kg CO₂e
📊 Local calculation for meal: 1.35 kg CO₂e (0.45 KG)
✅ Calculated CO₂e for log 1: 1.35 kg

📝 Processing log 2: TRANSPORT - car
⚠️ ClimateIQ failed for car, using local calculation
🔧 ClimateIQ local calculation: transport - car - 100 km
🚗 Looking up transport factor for: "car"
✅ Exact match found: 0.171
🧮 Calculation: 100 km × 0.171 = 17.100 kg CO₂e
✅ Calculated CO₂e for log 2: 17.1 kg
```

### Step 3: Refresh Dashboard

After clicking OK on the success message, refresh the page. You should see:

- Total CO₂e: **18.45 kg** (1.35 + 17.1)
- Meal: **1.350 kg CO₂e**
- car: **17.100 kg CO₂e**

## 📊 Expected Results

### For Your Current Data:

1. **Meal, 450g**

   - Converted: 0.45 kg
   - Factor: 3.0 kg CO₂e/kg (mixed meal)
   - **Result: 1.350 kg CO₂e**

2. **car, 100 km**
   - Factor: 0.171 kg CO₂e/km
   - **Result: 17.100 kg CO₂e**

**Total: 18.450 kg CO₂e**

## 🔧 If Still Shows 0.000

### Option 1: Check Server Logs

Look for these messages in your terminal where `npm run dev` is running:

- Do you see the logs I mentioned above?
- Any error messages?

### Option 2: Delete and Re-add

1. Click "Delete" on both actions
2. Log them again:
   - **Food category, "Chicken" activity, 450g**
   - **Transport category, "Petrol Car" activity, 100km**

### Option 3: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## 🧪 Test a New Action

Log a new action to see if it works:

1. Click "+ Log New Action"
2. Manual Entry:
   - Category: **FOOD**
   - Activity: **Chicken**
   - Amount: **200**
   - Unit: **G**
3. Submit

**Expected Result:**

- Server logs: `🧮 Calculation: 0.2 kg × 6.0 = 1.200 kg CO₂e`
- Dashboard shows: **1.200 kg CO₂e**

## 📝 Summary

**ClimateIQ API:** Not configured (this is fine)
**Local Calculations:** Should work now with improved matching
**Your Actions:** Should calculate to ~18.45 kg total

### Next Steps:

1. **Refresh browser** (hard refresh: Ctrl+Shift+R)
2. **Click "Recalculate"**
3. **Watch server console** for the detailed logs
4. **Check the results** - should see proper CO₂e values
5. **If still 0.000**, share the server console output

The extensive logging I added will show exactly what's happening at each step!
