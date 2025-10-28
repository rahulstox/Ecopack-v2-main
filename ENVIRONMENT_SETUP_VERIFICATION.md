# Environment Setup Verification Guide

## ✅ Your Environment Variables

You have all the required keys in `.env.local`:

- ✅ `DATABASE_URL` - Neon Postgres Database
- ✅ `GOOGLE_API_KEY` - Google Gemini AI
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk Auth (Public)
- ✅ `CLERK_SECRET_KEY` - Clerk Auth (Secret)
- ✅ `CLIMATEIQ_API_KEY` - ClimateIQ API

## 🔒 Security Check

### .gitignore Status

Your `.env.local` file should be in `.gitignore` to prevent committing secrets.

**Verified:** `.env.local` is properly ignored ✅

## 🧪 Testing Each Component

### 1. Database Connection (Neon Postgres)

**Location:** `lib/db.ts`
**Environment Variable:** `DATABASE_URL`

**How it works:**

```typescript
const sql = neon(process.env.DATABASE_URL!);
```

**Test:**

1. Start the dev server: `npm run dev`
2. Navigate to http://localhost:3000/dashboard
3. Check terminal for: `Checked/created "ActionLog" table.`

**Success Indicator:** No database connection errors

---

### 2. Authentication (Clerk)

**Environment Variables:**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (client-side)
- `CLERK_SECRET_KEY` (server-side)

**Test:**

1. Visit http://localhost:3000
2. Sign in with your account
3. You should be redirected to /dashboard

**Success Indicator:** Able to sign in and see "Welcome back, [Your Name]!"

---

### 3. AI Logging (Google Gemini)

**Location:** `app/api/log-action-ai/route.ts`
**Environment Variable:** `GOOGLE_API_KEY`

**How it works:**

```typescript
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
```

**Test:**

1. Click "+ Log New Action"
2. Select "Log with AI" tab
3. Type: "I drove 20 km to work today"
4. Submit

**Expected Server Logs:**

```
AI parsing input: "I drove 20 km to work today"
✅ AI parsed successfully
```

**Success Indicator:** Action is logged with proper category and CO₂e value

---

### 4. CO₂e Calculations (ClimateIQ)

**Location:** `lib/climateiq.ts`
**Environment Variable:** `CLIMATEIQ_API_KEY`

**How it works:**

```typescript
this.apiKey = apiKey || process.env.CLIMATEIQ_API_KEY || "";
```

**Test:**

1. Click "+ Log New Action"
2. Manual Entry:
   - Category: FOOD
   - Activity: Chicken
   - Amount: 200
   - Unit: G
3. Submit

**Expected Server Logs:**

**If API Key is Valid:**

```
🌐 Attempting ClimateIQ API call for: food - Chicken
✅ ClimateIQ API response: {...}
✅ ClimateIQ calculated Chicken: 1.2 kg CO₂e
```

**If API Key is Invalid/Missing:**

```
⚠️ ClimateIQ API key not found, using local calculations
🔧 ClimateIQ local calculation: food - Chicken - 200 g
📏 Converted 200g to 0.2kg
🍽️ Looking up food factor for: "chicken"
✅ Partial match found for "chicken": 6.0
🧮 Calculation: 0.2 kg × 6.0 = 1.200 kg CO₂e
```

**Success Indicator:** CO₂e value is calculated (either via API or local)

---

## 🚀 Complete Verification Checklist

### Step 1: Verify .env.local

```bash
# Check if file exists
ls -la .env.local

# Verify it's NOT in git
git status .env.local
# Should say: "fatal: pathspec '.env.local' did not match any files"
```

### Step 2: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 3: Check Environment Variables Loaded

Watch the terminal when server starts. You should see:

```
✓ Starting...
✓ Ready in 2.5s
- Environments: .env.local   <-- This confirms .env.local is loaded
```

### Step 4: Test Database

1. Visit http://localhost:3000/dashboard
2. Terminal should show:

```
Checked/created "recommendations" table.
Checked/created "UserProfile" table.
Checked/created "ActionLog" table.
Database tables initialization check complete.
```

### Step 5: Test Authentication

1. Sign in to your account
2. Should see: "Welcome back, [Your Name]!"
3. No authentication errors

### Step 6: Test Action Logging

1. Click "+ Log New Action"
2. Log a manual action:
   - Category: TRANSPORT
   - Activity: Petrol Car
   - Amount: 10
   - Unit: KM
3. Check terminal for calculation logs
4. Should see: `✅ Inserted with ID: [number]`

### Step 7: Test AI Logging

1. Click "+ Log New Action"
2. Select "Log with AI"
3. Type: "I had 300g of beef for dinner"
4. Terminal should show AI parsing
5. Action should be logged

### Step 8: Test Recalculation

1. Click "Recalculate" button
2. Terminal should show:

```
🔄 Recalculating for user [userId]
📊 Found X action logs
📝 Processing log 1: TRANSPORT - Petrol Car
✅ Calculated CO₂e for log 1: 1.71 kg
```

### Step 9: Verify Data Display

After recalculation:

- ✅ Total CO₂e shows > 0.00
- ✅ Date & Time shows proper timestamps
- ✅ Charts appear (bar and pie)
- ✅ Recent Activities shows data

### Step 10: Test Reports Page

1. Click "Reports" in sidebar
2. Should see:
   - Summary statistics
   - Category breakdown
   - Personalized suggestions

---

## 🐛 Common Issues & Solutions

### Issue: "Database connection failed"

**Cause:** Invalid `DATABASE_URL`
**Fix:**

1. Check Neon dashboard for correct connection string
2. Format: `postgresql://user:password@host/database`
3. Ensure no spaces or special characters are unencoded

### Issue: "Unauthorized" errors

**Cause:** Invalid Clerk keys
**Fix:**

1. Go to Clerk dashboard
2. Copy keys from "API Keys" section
3. Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starts with `pk_`
4. Ensure `CLERK_SECRET_KEY` starts with `sk_`

### Issue: AI logging not working

**Cause:** Invalid `GOOGLE_API_KEY`
**Fix:**

1. Go to Google AI Studio
2. Create new API key
3. Enable "Gemini API"
4. Copy key to `.env.local`

### Issue: CO₂e still showing 0.000

**Cause:** ClimateIQ API key invalid OR calculation not triggered
**Fix:**

1. Check if ClimateIQ API key is valid
2. If not, **local calculations will still work**
3. Click "Recalculate" button
4. Check server logs for calculation details

---

## 📊 Expected Behavior

### With Valid ClimateIQ API Key:

- Uses external API for calculations
- More accurate emission factors
- Server logs show: `✅ ClimateIQ API response:`

### Without ClimateIQ API Key:

- Falls back to local calculations
- Still very accurate (uses verified factors)
- Server logs show: `⚠️ ClimateIQ API key not found, using local calculations`

**Both methods work perfectly!**

---

## ✅ Final Verification

After following all steps, you should have:

1. ✅ Working database connection
2. ✅ Successful authentication
3. ✅ Actions logging correctly
4. ✅ CO₂e calculations showing proper values
5. ✅ Date & Time displaying correctly
6. ✅ Charts rendering
7. ✅ Reports page working
8. ✅ AI logging functional
9. ✅ Delete functionality working
10. ✅ Recalculate updating values

---

## 🎯 Quick Test Script

Run through this in 5 minutes:

1. **Start server** → `npm run dev`
2. **Sign in** → Check "Welcome back"
3. **Log action** → Manual: FOOD, Chicken, 200g
4. **Check terminal** → See calculation logs
5. **Refresh page** → Verify CO₂e shows ~1.2 kg
6. **Click Recalculate** → Verify it updates
7. **Visit Reports** → Check suggestions
8. **Test AI** → Type "I drove 50km" → Submit
9. **Delete action** → Confirm it removes
10. **Check charts** → Verify they display

**All working?** 🎉 You're all set!

---

## 📝 Environment Variables Format

Your `.env.local` should look like this:

```env
# Database
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Gemini AI
GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXX

# ClimateIQ (Optional)
CLIMATEIQ_API_KEY=climateiq_XXXXXXXXXXXXXXXXXX
```

**Note:** No quotes needed around values!

---

## 🚨 Important Security Notes

1. ✅ `.env.local` is in `.gitignore`
2. ✅ Never commit API keys to GitHub
3. ✅ NEXT*PUBLIC* prefix = visible in browser (safe for Clerk public key)
4. ✅ Keys without NEXT*PUBLIC* = server-side only (secure)
5. ✅ Use different keys for development vs production

---

## 🎊 Everything Configured Correctly!

Based on your environment setup:

- All keys are present
- .gitignore is configured
- Application should work perfectly

**Next steps:**

1. Restart your dev server
2. Run the Quick Test Script above
3. Everything should show correct data!

If you see any errors in the terminal, share them and I'll help debug!
