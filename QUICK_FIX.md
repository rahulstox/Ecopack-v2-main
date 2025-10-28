# 🔧 QUICK FIX for Gemini API Issues

## Problem
Getting error: "models/gemini-pro is not found"

## Solution Steps

### 1. Get a Working Google API Key

**EASIEST METHOD (Recommended):**
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Get API key" 
4. Click "Create API key in new project"
5. Copy the API key (starts with `AIzaSy...`)

### 2. Add to .env.local

Create or edit `.env.local` in your project root:

```env
GOOGLE_API_KEY="AIzaSyPASTE_YOUR_KEY_HERE"
```

**IMPORTANT:** 
- Replace `PASTE_YOUR_KEY_HERE` with your actual key
- Keep the quotes
- No spaces around the `=`

### 3. Restart Server

1. Press `Ctrl+C` to stop the server
2. Run: `npm run dev`
3. Wait for "Ready"

### 4. Test the API Key

Visit: `http://localhost:3000/api/test-models`

**Expected Result:**
```json
{
  "success": true,
  "message": "API key is valid and working",
  "response": "Hello"
}
```

### 5. Try Recommendation Again

If test works, go to `http://localhost:3000/recommend` and submit a recommendation.

## Troubleshooting

### Still getting 404 error?
- Your API key might not have access to Gemini
- Try creating a NEW API key from aistudio.google.com
- Make sure you're using the key that starts with `AIzaSy`

### Can't find .env.local file?
1. Create a new file named exactly `.env.local` (with the dot at the start)
2. Location: `C:\Users\kakuu\OneDrive\Desktop\ecopack ai\.env.local`
3. Add the content from step 2 above

### Server not reloading?
1. Press `Ctrl+C` to stop
2. Make sure you saved `.env.local`
3. Run `npm run dev` again

## Still Not Working?

**Alternative:** Use a mock/fallback mode for testing
- The recommendation will use placeholder data
- Database will still work
- Perfect for testing the UI

Let me know if you need help with any step!

