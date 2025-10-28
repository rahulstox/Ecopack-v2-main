# How to Get AI Recommendations Working

Your app currently uses intelligent recommendations (works well!), but if you want actual AI-powered recommendations, follow these steps:

## Method 1: Google Gemini API (FREE)

### Step 1: Get Your API Key

1. **Go to Google AI Studio**: https://aistudio.google.com/app/apikey
2. **Click "Get API key"**
3. **Sign in** with your Google account
4. **Create API key**
5. **Copy the key** (starts with `AIzaSy...`)

### Step 2: Add to .env.local

Open your `.env.local` file and add:

```env
GOOGLE_API_KEY="AIzaSyYOUR_ACTUAL_KEY_HERE"
```

### Step 3: Restart Server

1. Press `Ctrl+C` to stop
2. Run `npm run dev`
3. Try creating a recommendation

## Method 2: OpenAI API (Paid but Better)

If you prefer OpenAI:

### Step 1: Get API Key

1. Go to https://platform.openai.com
2. Sign up and add billing
3. Get your API key
4. Add to `.env.local`:

```env
OPENAI_API_KEY="sk-..."
```

### Step 2: Update Code

I can switch the code to use OpenAI instead of Gemini if you want.

## Current Status

✅ **Works without API** - Intelligent recommendations based on your inputs
❌ **AI not connected** - Need valid API key

## Test Your API Key

Visit: `http://localhost:3000/api/test-models`

This will show you:
- If your API key is configured
- Which models are available
- If it's working

## Quick Guide to Get Started

**Easiest Option**: 
1. Get free Gemini key: https://aistudio.google.com/app/apikey
2. Add to `.env.local`: `GOOGLE_API_KEY="your-key"`
3. Restart server

**Want me to help you set it up?** Just get the API key and I'll guide you through the rest!

