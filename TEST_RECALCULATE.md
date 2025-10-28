# How to Fix CO₂e Display

## The Issue

Your dashboard shows 3 actions with "0.000" CO₂e because:

1. ✅ Dates ARE working (Oct 28, 2025, 01:25 PM)
2. ❌ CO₂e showing 0.000

## Solution: Click Recalculate Button

### Step 1: Click the Button

Look at the top right of your dashboard. You should see a blue button labeled:
**"Recalculate"**

Click it!

### Step 2: Wait

You'll see a loading indicator and then a success message.

### Step 3: Refresh Page

Press **Ctrl + Shift + R** to hard refresh.

### Step 4: Verify

Your CO₂e values should now show:

- **0.075 kg** (for 150g veg meal)

---

## Why This Happens

The existing actions were logged before we fixed the calculation. The "Recalculate" button:

1. Fetches all your actions
2. Recalculates each one with the new formula
3. Updates the database
4. Shows the correct values

---

## Expected Result

### Before:

```
DATE & TIME           CATEGORY  CO₂E (KG)
Oct 28, 2025, 1:25 PM  FOOD     0.000
Oct 28, 2025, 1:22 PM  FOOD     0.000
Oct 28, 2025, 11:27 AM FOOD     0.000
```

### After Recalculate:

```
DATE & TIME           CATEGORY  CO₂E (KG)
Oct 28, 2025, 1:25 PM  FOOD     0.075
Oct 28, 2025, 1:22 PM  FOOD     0.075
Oct 28, 2025, 11:27 AM FOOD     0.075
```

Each 150g veg meal = 0.15kg × 0.5 = **0.075 kg CO₂e**

---

## If Recalculate Doesn't Work

Run this in browser console (F12):

```javascript
fetch("/api/recalculate-actions", { method: "POST" })
  .then((r) => r.json())
  .then((data) => {
    console.log("Result:", data);
    if (data.success) {
      console.log(`✅ Updated ${data.updated} actions`);
    } else {
      console.log("❌ Error:", data.error);
    }
  });
```

Then refresh the page!
