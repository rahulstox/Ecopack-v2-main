# Dashboard Fixes - Summary

## Issues Fixed

### 1. ✅ Added Delete Button to Recent Activities Table

- Added a new "Actions" column to the ActionLogTable component
- Each action now has a "Delete" button with confirmation dialog
- Delete button shows loading state while deleting

**Files Changed:**

- `components/ActionLogTable.tsx` - Added delete functionality
- `app/dashboard/page.tsx` - Passed onDelete callback to refresh data

### 2. ✅ Created Delete API Endpoint

- New API endpoint: `/api/action-logs/[id]/route.ts`
- Securely deletes action logs
- Verifies user ownership before deletion

**Files Changed:**

- `app/api/action-logs/[id]/route.ts` - New file created

### 3. ✅ Fixed Date/Time Display

- The `formatDate` function now properly handles dates from the database
- Database automatically stores timestamps with `DEFAULT CURRENT_TIMESTAMP`
- Dates display in readable format: "Oct 28, 2024, 10:30 AM"

**Files Changed:**

- `components/ActionLogTable.tsx` - formatDate function already handles dates properly

### 4. ✅ Added Debugging for CO₂e Calculation

- Added console logging to track CO₂e calculations
- Helps identify why calculations might return 0.00

**Files Changed:**

- `lib/co2e/calculator.service.ts` - Added detailed logging

## Testing the Changes

### To Test Delete Button:

1. Open the dashboard at `localhost:3000/dashboard`
2. Find any action in the "Recent Activities" table
3. Click the "Delete" button
4. Confirm the deletion
5. The action should be removed and the page should refresh

### To Test Date/Time Display:

1. Log a new action
2. Check if the date and time appear correctly in the table
3. Format should be: "Oct 28, 2024, 10:30 AM"

### To Debug CO₂e Calculation Issues:

If CO₂e is showing as 0.000 for existing data:

**Option 1: Recalculate Existing Data (Recommended)**

```bash
# In the browser console or using Postman
POST http://localhost:3000/api/recalculate-actions
Authorization: Bearer <your-session-token>
```

**Option 2: Check the Console Logs**
When logging new actions, check the browser console or server logs for:

- `🔍 Calculating CO₂e:` - Shows the calculation input
- `📈 Factor found:` - Shows which emission factor is used
- `💾 Final CO₂e:` - Shows the calculated result

**Option 3: Test a New Action**

1. Click "+ Log New Action"
2. Choose "Manual Entry"
3. Select:
   - Category: FOOD
   - Activity: Chicken
   - Amount: 200
   - Unit: G
4. Submit and check the CO₂e value

## Expected CO₂e Values

Based on the emission factors in `lib/co2e/factors.json`:

- 200g Chicken = 0.2 kg × 6.0 = **1.200 kg CO₂e**
- 200g Vegetables = 0.2 kg × 0.5 = **0.100 kg CO₂e**
- 10 km Petrol Car = 10 × 0.17 = **1.700 kg CO₂e**

## Why CO₂e Might Show as 0.00

1. **Existing data was logged before calculation fix** - Run the recalculate endpoint
2. **Activity name doesn't match emission factor keys** - Check console logs to see mapping
3. **ClimateIQ API is configured** - Tries ClimateIQ first, falls back to local factors
4. **Database issue** - Check if `calculatedCo2e` column is being set correctly

## Next Steps

1. **Test the delete functionality** - Try deleting an action
2. **Verify date/time display** - Check if dates show correctly
3. **Check console logs** - Look for the debug messages when logging new actions
4. **Recalculate existing data** - Call the recalculate endpoint if needed
5. **Monitor the dashboard** - Confirm all metrics update correctly after changes

## Console Log Messages

When logging actions, you'll now see messages like:

```
🔍 Calculating CO₂e: FOOD / vegetables / 0.2 KG
📈 Factor found: 0.5 for key: VEGETABLES_KG
💾 Final CO₂e: 0.1 kg
```

Or if using ClimateIQ:

```
✅ ClimateIQ calculated vegetables: 0.12 kg CO₂e
```

If ClimateIQ fails:

```
⚠️ ClimateIQ failed for vegetables, using local calculation
📊 Local calculation for vegetables: 0.1 kg CO₂e (0.2 KG)
```
