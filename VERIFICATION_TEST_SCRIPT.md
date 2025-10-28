# Complete Verification Test Script

## 🧪 Run These Tests and Share Results

### Test 1: Start Server and Check Logs

**Run this command:**

```bash
npm run dev
```

**Look for these messages in the terminal:**

```
✓ Starting...
✓ Ready in X.Xs
- Local:        http://localhost:3000
- Environments: .env.local
```

**✅ PASS if you see:** Server starts without errors
**❌ FAIL if you see:** Database connection errors or missing environment variables

---

### Test 2: Database Initialization

**What to check:**
After server starts, visit: http://localhost:3000/dashboard

**Expected terminal output:**

```
Checked/created "recommendations" table.
Checked/created "UserProfile" table.
Checked/created "ActionLog" table.
Database tables initialization check complete.
```

**✅ PASS if you see:** All three tables created/checked
**❌ FAIL if you see:** Database connection errors

---

### Test 3: Click "Recalculate" Button

**Steps:**

1. Go to dashboard
2. Click the blue "Recalculate" button
3. Watch the terminal

**Expected terminal output:**

```
🔄 Recalculating for user user_[your-id]
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

**✅ PASS if you see:** Calculation logs and "Successfully recalculated X actions!"
**❌ FAIL if you see:** "Found 0 action logs" or errors

---

### Test 4: Log New Action

**Steps:**

1. Click "+ Log New Action"
2. Manual Entry:
   - Category: **FOOD**
   - Activity: **Chicken**
   - Amount: **200**
   - Unit: **G**
3. Click Submit
4. Watch terminal

**Expected terminal output:**

```
💾 Inserting action log: {category: 'FOOD', activity: 'Chicken', amount: 200, unit: 'G', ...}
⚠️ ClimateIQ API key not found, using local calculations
🔧 ClimateIQ local calculation: food - Chicken - 200 g
📏 Converted 200g to 0.2kg
🍽️ Looking up food factor for: "chicken"
✅ Partial match found for "chicken": 6.0
🧮 Calculation: 0.2 kg × 6.0 = 1.200 kg CO₂e
💾 Inserted log with timestamp: [timestamp]
✅ Inserted with ID: [number]
```

**✅ PASS if you see:** CO₂e = 1.200 kg and action saved
**❌ FAIL if you see:** CO₂e = 0.000 or errors

---

### Test 5: Fetch Action Logs

**Steps:**

1. Refresh the dashboard page
2. Watch terminal

**Expected terminal output:**

```
📊 Fetched action logs: 3 entries
📅 Sample loggedAt: [timestamp]
📋 Returning logs to client: 3
📅 First log loggedAt value: [timestamp]
```

**✅ PASS if you see:** Action count > 0 and timestamps present
**❌ FAIL if you see:** 0 entries or loggedAt is null

---

### Test 6: Check Dashboard Display

**What to look for on the dashboard:**

- Total CO₂e: Should show **~19.65 kg** (1.35 + 17.1 + 1.2)
- This Month: Should show same value
- Total Actions: Should show **3**
- Recent Activities table: Should show 3 entries with proper CO₂e values
- Charts: Should display (bar chart and pie chart)

**✅ PASS if:** All values are correct and not 0.000
**❌ FAIL if:** Values show 0.000 or "N/A" for dates

---

## 📋 Share This Information

Please copy and paste from your terminal:

### 1. Server Startup Logs

```
[Paste the logs from when you run npm run dev]
```

### 2. Recalculate Logs

```
[Paste the logs from clicking Recalculate button]
```

### 3. Dashboard Fetch Logs

```
[Paste the logs from refreshing dashboard]
```

### 4. New Action Logs

```
[Paste the logs from logging a new action]
```

### 5. Any Error Messages

```
[Paste any red error messages]
```

---

## 🎯 Quick Diagnostic Commands

Run these commands and share the output:

### Check if .env.local exists

```bash
ls -la .env.local
```

### Check Node version

```bash
node --version
```

### Check if all dependencies are installed

```bash
npm list --depth=0
```

---

## 🔍 Common Patterns to Look For

### ✅ GOOD - Working Correctly:

```
✅ Calculated CO₂e for log X: [number] kg
📊 Fetched action logs: [number > 0] entries
💾 Inserted with ID: [number]
🧮 Calculation: [amount] × [factor] = [result] kg CO₂e
```

### ❌ BAD - Issues to Report:

```
❌ Error: [any error message]
⚠️ Found 0 action logs
Database connection failed
TypeError: Cannot read property
calculatedCo2e is undefined
```

---

## 📸 Screenshot Checklist

Please share screenshots of:

1. Dashboard showing stats (top section)
2. Recent Activities table
3. Terminal output from startup
4. Terminal output after clicking Recalculate
5. Any error dialogs

---

## 🚀 If Everything Works

You should see:

- ✅ Server starts without errors
- ✅ Database tables created
- ✅ Actions can be logged
- ✅ CO₂e calculations show proper values (not 0.000)
- ✅ Dates show timestamps (not "N/A")
- ✅ Charts display when data exists
- ✅ Recalculate button works
- ✅ Delete button works
- ✅ Reports page shows suggestions

---

## 📝 Test Results Form

Fill this out and share:

```
Test 1 - Server Start: [ ] PASS [ ] FAIL
Test 2 - Database Init: [ ] PASS [ ] FAIL
Test 3 - Recalculate: [ ] PASS [ ] FAIL
Test 4 - Log New Action: [ ] PASS [ ] FAIL
Test 5 - Fetch Logs: [ ] PASS [ ] FAIL
Test 6 - Dashboard Display: [ ] PASS [ ] FAIL

Expected CO₂e (Meal 450g): 1.350 kg
Actual CO₂e: _______ kg

Expected CO₂e (car 100km): 17.100 kg
Actual CO₂e: _______ kg

Expected CO₂e (Chicken 200g): 1.200 kg
Actual CO₂e: _______ kg

Total Expected: 19.650 kg
Total Actual: _______ kg

Date/Time Format: [ ] Showing timestamps [ ] Showing "N/A"
Charts Visible: [ ] Yes [ ] No
```

Share your test results and I'll help fix any issues!
